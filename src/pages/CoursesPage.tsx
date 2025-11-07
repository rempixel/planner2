import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Col, Collapse, ListGroup, Row } from 'reactstrap';
import { CourseRow } from '../components/CourseRow';
import { SubjectRow } from '../components/SubjectRow';
import { Course, Subject } from '../models/Schedule';
import { useApp, useSchedule, useUpdateApp } from '../providers';
import { SectionContainer } from '../components/SectionContainer';
import { SectionEntry } from '../components/SectionEntry';

export const CoursesPage: FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
  const [isCollapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (selectedCourse) {
      setCollapsed(true);
    }
  }, [selectedCourse]);

  return (
      <div 
      style= {{
        width: '100%',
        minHeight:'80vh', 
      }}
      className= "border-bottom border-dark d-flex"
      >
        <Col md="4" lg="3" xl="2" className="p-0">
          <SectionContainer>
            <SubjectBrowserSection reporter={setSelectedSubject} />
          </SectionContainer>
        </Col>
        <Col className="border-start border-end border-dark p-0">
          <SectionContainer>
            <CourseBrowserSection reporter={setSelectedCourse} selectedSubject={selectedSubject} />
          </SectionContainer>
        </Col>
        <Collapse style={{maxWidth: '25vw'}} className="p-2" isOpen={isCollapsed} horizontal={true}> 
          <Col>
            <SectionContainer>
              <CourseInfoSection course={selectedCourse} />
            </SectionContainer>
          </Col>
        </Collapse>
      </div>
  ); //When you click on a subject, it uncollapses the section container?
  // CSS Flexbox approach because BootStrap Col/Rows are stiff. 
  // TODO: fix Mobile representation. Maybe make it use Row instead of div when on a vertical screen.
};

export type CourseBrowserReducerAction = 'addCourse' | 'removeCourse' | 'selectCourse';

interface CourseBrowserSectionProps {
  readonly reporter: (course: Course) => void;
  readonly selectedSubject?: Subject;
}

const CourseBrowserSection: FC<CourseBrowserSectionProps> = ({ reporter, selectedSubject }) => {
  const app = useApp();
  const { courses } = useSchedule();
  const updateApp = useUpdateApp();

  const resolveAdded = useCallback(
    (sc: Course) => {
      return app.selectedCourses.includes(sc.code);
    },
    [app.selectedCourses],
  );

  const filteredCourses = selectedSubject
    ? courses.filter((c) => c.subject.code === selectedSubject.code)
    : courses;

  const handleReporting = useCallback(
    (sc: Course, action: CourseBrowserReducerAction) => {
      switch (action) {
        case 'addCourse': {
          if (!resolveAdded(sc)) {
            updateApp('selectedCourses', [...app.selectedCourses, sc.code]);
          }
          break;
        }

        case 'removeCourse': {
          if (resolveAdded(sc)) {
            updateApp(
              'selectedCourses',
              app.selectedCourses.filter((c) => c !== sc.code),
            );
          }
          break;
        }

        case 'selectCourse': {
          reporter(sc);
          break;
        }

        default: {
          throw new Error('Unknown action');
        }
      }
    },
    [app.selectedCourses, reporter, resolveAdded, updateApp],
  );

  return (
    <ListGroup>
      {filteredCourses.map((course, idx) => (
        <CourseRow
          striped={idx % 2 === 1}
          reporter={(action: CourseBrowserReducerAction) => {
            handleReporting(course, action);
          }}
          added={resolveAdded(course)}
          key={`course-${course.subject.code}-${course.code}`}
          course={course}
        />
      ))}
    </ListGroup>
  );
};

interface SubjectBrowserSectionProps {
  readonly reporter: (s: Subject) => void;
}

const SubjectBrowserSection: FC<SubjectBrowserSectionProps> = ({ reporter }) => {
  const { subjects } = useSchedule();
  return (
    <ListGroup>
      {subjects.map((subject, idx) => {
        return (
          <SubjectRow
            report={() => {
              reporter(subject);
            }}
            subject={subject}
            key={`subject-${subject.code}`}
            isStriped={idx % 2 === 1}
          />
        );
      })}
    </ListGroup>
  );
};

interface CourseInfoSectionProps {
  course?: Course;
}

const CourseInfoSection: FC<CourseInfoSectionProps> = ({ course }) => {
  if (!course) {
    return (
      <>
        <h2>No Course Selected</h2>
        <p>Select a course to get started.</p>
      </>
    );
  }

  return (
    <>
      <h2>{course.title}</h2>
      <p>
        {course.subject.code} {course.code}
      </p>
      <hr />
      <h4>Sections</h4>
      {course.sections.map((section, idx) => (
        <SectionEntry section={section} key={idx} />
      ))}
      <hr />
      <h4>Course Description</h4>
      <div dangerouslySetInnerHTML={{ __html: course.description }} />
      <hr />
      <h4>Raw Object</h4>
      <pre style={{ overflow: 'auto' }}>{JSON.stringify(course)}</pre>
    </>
  );
};
