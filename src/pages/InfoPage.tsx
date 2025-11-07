import React, { FC } from 'react';
import { Alert } from 'reactstrap';

export const InfoPage: FC = () => {
  return (
    <>
      <Alert className="my-2" color="info">
        This page will serve a different purpose when in a production environment.
      </Alert>
      <h2>Info Page</h2>
      <article>
        <h3>About</h3>
        <p>
          This project exists to improve upon the WPI Planner, a webapp created in 2014 by{' '}
          <a href="https://github.com/Nican/wpischeduler">Henrique Polido</a> and maintained
          primarily by <a href="https://github.com/Jmckeen8/wpiplanner">Jordyn McKeen</a>. Given the
          age of the project, it was not designed with mobile interfaces in mind, and lacks some
          critical features for the modern student. This project aims to complete three stages:
        </p>
        <ol>
          <li>
            To achieve parody with the existing WPI planner, but in a modern and extensible
            codebase.
          </li>
          <li>
            To address critical feature needs that are not possible in the current planner, such as
            viewing Summer Courses or multiple years at once.
          </li>
          <li>
            To enter a maintance mode focusing on fixes and maintance until the project receives a
            new maintainer.
          </li>
        </ol>

        <p>
          As of AY25-26, I am a senior, so my time here is short. I want to leave something that
          others can continue to build upon and to serve the students for as long as the existing
          planner has.
        </p>
      </article>
      <article>
        <h3>Author</h3>
        <p>
          This application is written by{' '}
          <a target="_blank" rel="noreferrer" href="https://github.com/zenisbestwolf">
            Zen Dignan
          </a>
          , a Computer Science student at WPI.
        </p>
        <p>
          Their inspiration for this project comes from their mentor, who is the original author of
          the <a href="https://planner.wpi.edu/">current WPI Planner</a>.
        </p>
      </article>
      <article>
        <h3>Current Status</h3>
        <p>
          At the moment, the application is not fully functional. Working on this inbetween my job
          and regular classes is difficult. If you wish to contribute, please do so{' '}
          <a href="https://github.com/zenisbestwolf/planner2">here</a>.
        </p>
      </article>
    </>
  );
};
