import React, { FC } from 'react';
import { CourseSection } from '../models/Schedule';
import { Card, CardBody, CardText, CardTitle } from 'reactstrap';
import { capacityToString } from '../utils';
import { Time } from '.';

export const SectionEntry: FC<{ readonly section: CourseSection }> = ({ section }) => {
  return (
    <Card 
    style={{margin: '2% auto',}}
    >
      <CardBody>
        <CardTitle tag="p"> {section.term} - {section.instructors} </CardTitle>
        <ul>
          <li>Enrollment: {capacityToString(section.enrollment)} seats remaining</li>
          <li>Waitlist: {capacityToString(section.waitlist)} seats remaining</li>
        </ul>
        <p>Patterns</p>
        {section.patterns.map((p) => <>{p.days.map((d) => `${d} `)}<Time time={p.startTime} /> - <Time time={p.endTime} /> @ {p.locationId}</>)}
      </CardBody>
    </Card>
  )
};
