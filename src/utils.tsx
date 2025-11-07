import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';
import { Capacity, Course, CourseSection, TermPeriod, TermStatus } from './models/Schedule';

export const useObjectState = <T extends object>(
  initialState: T,
): [T, (key: keyof T, value: T[keyof T]) => void, Dispatch<SetStateAction<T>>] => {
  const [object, setObject] = useState<T>(initialState);

  const dispatch = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      setObject({
        ...object,
        [key]: value,
      });
    },
    [object, setObject],
  );

  return [object, dispatch, setObject];
};

export const useCheckboxState = (
  defaultValue: boolean,
): [boolean, (event: ChangeEvent<HTMLInputElement>) => void, (value: boolean) => void] => {
  const [value, setValue] = useState(defaultValue);
  const setter = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.checked);
  }, []);

  return [value, setter, setValue];
};

export const noop = (): void => {
  /* noop */
};

const sectionAvailability = (section: CourseSection): TermStatus => {
  const { enrollment, waitlist } = section;

  const hasEnrollmentSeats = enrollment.disabled ? false : enrollment.remaining !== 0;
  const hasWaitlistSeats = waitlist.disabled ? false : waitlist.remaining !== 0;

  if (!hasEnrollmentSeats && !hasWaitlistSeats) {
    return 'Full';
  }

  if (!hasEnrollmentSeats && hasWaitlistSeats) {
    return 'Waitlisted';
  }

  return 'Available';
};

export const getCourseAvailability = (course: Course): Map<TermPeriod, TermStatus> => {
  const validTerms = getCourseTerms(course);
  const result = new Map<TermPeriod, TermStatus>();

  for (const term of validTerms) {
    let status: TermStatus | undefined;

    const validSections = course.sections.filter((s) => s.term === term);

    for (const section of validSections) {
      status = sectionAvailability(section);
    }

    status ??= 'Disabled';

    result.set(term, status);
  }

  return result;
};

export const getCourseTerms = (course: Course): TermPeriod[] => [
  ...new Set(course.sections.map((s) => s.term)),
];

export const capacityToString = (capacity: Capacity): string =>
  `${capacity.remaining}/${capacity.maximum}`;
