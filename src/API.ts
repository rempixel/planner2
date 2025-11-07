import {
  academicLevels,
  Course,
  CourseSection,
  deliveryModes,
  Schedule,
  sectionFormats,
  Subject,
  termPeriods,
} from './models/Schedule';
import { RemoteEntry, RemoteResponse } from './models/Workday';

import { Capacity, CourseTime, DayCode, Pattern } from './models/Schedule';
import { Hour, Minute } from './models/Time';

type SectionlessCourse = Omit<Course, 'sections'>;

interface ParsedResponse {
  newSubject?: Subject;
  course: SectionlessCourse;
  section: CourseSection;
}

export class ScheduleError extends Error {
  public constructor(msg?: string) {
    super(msg);
  }
  name = 'ScheduleError';
}

class TimeError extends ScheduleError {
  public constructor(msg?: string) {
    super(msg);
  }
  name = 'TimeError';
}

class RequestError extends Error {
  public override name = 'RequestError';
  public constructor(
    public readonly response: { payload: unknown; headers: Headers; status: number },
  ) {
    super(`Request failed`);
  }
}

export const pullSchedule = async (): Promise<Schedule> => {
  let data: RemoteResponse;
  // TODO: this could be better lord.
  const url =
    globalThis.location.hostname === 'localhost'
      ? `http://localhost:8081`
      : `https://gcbp.wpi.institute`;

  // const response = await fetch(`https://courselistings.wpi.edu/assets/prod-data.json`);
  const response = await fetch(`${url}/assets/prod-data.json`);

  const body = await response.text();

  try {
    data = JSON.parse(body) as unknown as RemoteResponse;
  } catch {
    console.error(response);
    throw new RequestError({
      payload: body,
      headers: response.headers,
      status: response.status,
    });
  }

  return processData(data);
};

const courseIdentifier = (course: { subject: Subject; code: string }): string =>
  `${course.subject.code} ${course.code}`;

const mapToArray = <T>(map: Map<string, T>): T[] => {
  const result: T[] = [];

  for (const value of map.values()) {
    result.push(value);
  }

  return result;
};

const processData = (data: RemoteResponse): Schedule => {
  let schedule: Schedule = {
    subjects: [],
    courses: [],
  };

  const { Report_Entry: entries } = data;

  const subjectMap = new Map<string, Subject>();
  const courseMap = new Map<string, Course>();

  for (const entry of entries) {
    try {
      const { newSubject, course, section } = parseEntry(entry, subjectMap, courseMap);

      // If the section that was parsed has this tag, it's not real. It's for waitlist and interest groups.
      if ('Course Type' in section.tags && section.tags['Course Type'] === 'Waitlist Section') {
        continue;
      }

      if (newSubject) {
        subjectMap.set(newSubject.code, newSubject);
      }

      const lookup = courseMap.get(courseIdentifier(course));

      if (lookup) {
        lookup.sections.push(section);
      } else {
        courseMap.set(courseIdentifier(course), { ...course, sections: [section] });
      }

      schedule = {
        subjects: mapToArray(subjectMap),
        courses: mapToArray(courseMap),
      };
    } catch (error) {
      if (error instanceof TimeError || error instanceof ScheduleError) {
        console.log(`An error occurred on an entry with title ${entry.Course_Title}`);
        console.error(error);
        continue;
      }

      throw error;
    }
  }

  return schedule;
};

const getLocationsAndPatterns = (
  raw: RemoteEntry,
): { locations: string[]; patterns: Pattern[] } => {
  const locations: string[] = [];
  const patterns: Pattern[] = [];
  for (const pattern of raw.Section_Details.split('; ')) {
    if (pattern === 'Online-asynchronous |') {
      locations.push('Online-asynchronous');
      break;
    }

    if (pattern === 'Online-synchronous |') {
      locations.push('Online-synchronous');
      break;
    }

    if (pattern === 'Online (inactive) |') {
      locations.push('Online');
      break;
    }

    if (pattern === 'Other |') {
      locations.push('Other');
      break;
    }

    if (pattern === 'Off Campus |') {
      locations.push('Off Campus');
      break;
    }

    if (pattern === '') continue;

    const patternPortions = pattern.split(' | ');
    if (patternPortions.length !== 3) {
      throw new ScheduleError(
        `Patterns are not behaving as expected. Got ${patternPortions.length} when expecting 3 on pattern: ${pattern}`,
      );
    }

    const times = patternPortions[2].split(' - ');

    let startTime: CourseTime;
    let endTime: CourseTime;

    try {
      startTime = convertTime(times[0]);
      endTime = convertTime(times[1]);
    } catch (error) {
      if (error instanceof TimeError) {
        throw new ScheduleError(`Error in parsing times for ${raw.Course_Title}`);
      }

      throw error as Error;
    }

    const newPattern: Pattern = {
      locationId: patternPortions[0],
      days: patternPortions[1].split('-') as DayCode[],
      startTime,
      endTime,
    };

    locations.push(patternPortions[0]);
    patterns.push(newPattern);
  }
  if (locations.length === 0) locations.push('None');

  return { locations, patterns };
};

// TODO: Review if changes to this function would result in incorrect subject calculation.
const getSubject = (raw: RemoteEntry): Subject => {
  // eslint-disable-next-line unicorn/prefer-string-slice
  const subjectCode = raw.Course_Title.substring(0, raw.Course_Title.indexOf(' '));
  const allSubjects = raw.Subject.split('; ');
  // eslint-disable-next-line unicorn/prefer-at
  const trueSubject = allSubjects[allSubjects.length - 1];

  return {
    code: subjectCode,
    name: trueSubject,
  };
};

const getWaitlist = (raw: RemoteEntry): Capacity => {
  const wlParts = raw.Waitlist_Waitlist_Capacity.split('/');
  if (wlParts.length !== 2) {
    throw new ScheduleError('Waitlist_Waitlist_Capacity is misbehaving.');
  }

  const wlOccuppied = +wlParts[0];
  const wlMaximum = +wlParts[1];

  return {
    remaining: wlMaximum - wlOccuppied,
    maximum: wlMaximum,
    disabled: wlMaximum === 0 && wlOccuppied === 0,
  } satisfies Capacity;
};

const getEnrollment = (raw: RemoteEntry): Capacity => {
  const elParts = raw.Enrolled_Capacity.split('/');
  if (elParts.length !== 2) {
    throw new ScheduleError('Enrolled_Capacity is misbehaving.');
  }

  const elOccuppied = +elParts[0];
  const elMaximum = +elParts[1];

  return {
    remaining: elMaximum - elOccuppied,
    maximum: elMaximum,
    disabled: elMaximum === 0 && elOccuppied === 0,
  } satisfies Capacity;
};

const getTags = (raw: RemoteEntry): Record<string, string> => {
  const tagParts = raw.Course_Tags.split('; ');
  const tags: Record<string, string> = {};
  for (const part of tagParts) {
    const portions = part.split(' :: ');
    tags[portions[0]] = portions[1];
  }
  return tags;
};

const assertScheduleLiteral = <T extends string>(
  raw: RemoteEntry,
  valueOrKey: string,
  list: readonly T[],
  errMsg?: string,
): T => {
  let value = valueOrKey;
  if (valueOrKey in raw) {
    value = raw[valueOrKey as keyof typeof raw];
  }

  const result = list.find((v) => v === value);
  if (result) {
    return result;
  }

  throw new ScheduleError(errMsg);
};

/**
 * Get a Sectionless Course object from a Workday API response
 * @param raw Workday API response object
 * @param subject Subject object of course to parse
 * @returns Parsed course without sections
 */
const parseCourse = (raw: RemoteEntry, subject: Subject): SectionlessCourse => {
  /* Parse Academic_level */
  const academicLevel = assertScheduleLiteral(
    raw,
    'Academic_Level',
    academicLevels,
    `Invalid Delivery_Mode passed: ${raw.Delivery_Mode}`,
  );

  /* Parse Credits */
  const credits = Number.parseFloat(raw.Credits);
  if (Number.isNaN(credits)) throw new ScheduleError(`Invalid credits value ${raw.Credits}`);

  /* Parse Course Code */
  const code = raw.Course_Title.split(' - ')[0].replace(`${subject.code} `, '');

  /* Parse Title */
  const title = raw.Course_Title.split(' - ')[1];

  const { Public_Notes: notes, Course_Description: description } = raw;

  return {
    academicLevel,
    credits,
    code,
    notes,
    description,
    title,
    subject,
  } satisfies SectionlessCourse;
};

const parseEntry = (
  raw: RemoteEntry,
  subjectMap: Map<string, Subject>,
  courseMap: Map<string, Course>,
): ParsedResponse => {
  /* Parse Subject */
  const calculatedSubject = getSubject(raw);
  const subjectLookup = subjectMap.get(calculatedSubject.code);
  const subject = subjectLookup ?? calculatedSubject;

  const courseLookup = courseMap.get(raw.Course_Title.split(' - ')[0]);

  const course = courseLookup ?? parseCourse(raw, subject);

  /* Parse Course_Tags */
  const tags = getTags(raw);

  /* Parse Delivery_Mode */
  const deliveryMode = assertScheduleLiteral(
    raw,
    'Delivery_Mode',
    deliveryModes,
    `Invalid Delivery_Mode passed: ${raw.Delivery_Mode}`,
  );

  /* Parse Enrollment */
  const enrollment = getEnrollment(raw);

  /* Parse Locations & Patterns */
  const { locations, patterns } = getLocationsAndPatterns(raw);

  /* Parse Format */
  const format = assertScheduleLiteral(
    raw,
    'Instructional_Format',
    sectionFormats,
    `Invalid format: ${raw.Instructional_Format}`,
  );

  /* Parse Dates */
  const startDate = new Date(raw.Course_Section_Start_Date);
  const endDate = new Date(raw.Course_Section_End_Date);

  /* Parse Term */
  const rawTerm = raw.Starting_Academic_Period_Type.replace(' Term', '');
  const term = assertScheduleLiteral(raw, rawTerm, termPeriods, `Invalid term: ${rawTerm}`);

  /* Parse Waitlist */
  const waitlist = getWaitlist(raw);

  const { Instructors: instructors } = raw;

  const section: CourseSection = {
    enrollment,
    deliveryMode,
    endDate,
    startDate,
    term,
    tags,
    waitlist,
    locations,
    patterns,
    instructors,
    format,
    // TODO: DEBUG. WILL INCREASE MEMORY USAGE DRASTICALLY. DO NOT LEAVE IN FOR PROD.
    raw,
  };

  return { newSubject: subjectLookup ? undefined : subject, course, section };
};

const convertTime = (input: string): CourseTime => {
  const rawHour = Number.parseInt(input.split(':')[0], 10);
  const PM = input.toUpperCase().includes('PM');

  if (rawHour > 23 || rawHour < 0) {
    throw new TimeError('Invalid hour');
  }

  const hour = (rawHour < 12 && PM ? rawHour + 12 : rawHour) as Hour;

  const rawMinute = Number.parseInt(input.split(':')[1].split(' ')[0]);
  if (rawMinute > 59 || rawMinute < 0) {
    throw new TimeError('Invalid minute');
  }

  const minute = rawMinute as Minute;

  return { hour, minute } satisfies CourseTime;
};
