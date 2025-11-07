import React, { createContext, FC, useCallback, useContext, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import { Container, Spinner } from 'reactstrap';
import { pullSchedule } from './API';
import { NavBar } from './components/NavBar';
import { Schedule } from './models/Schedule';
import { CoursesPage } from './pages/CoursesPage';
import { InfoPage } from './pages/InfoPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { TimesPage } from './pages/TimesPage';
import { Application, ApplicationContext, SchedulerContext } from './providers';
import { useObjectState } from './utils';
import { Disclaimer } from './components/Disclaimer';

const LoadingContext = createContext(true);

export const App: FC = () => {
  const [schedule, setSchedule] = useState<Schedule>({} as never);
  const [loading, setLoading] = useState(true);
  const [application, setApplication, rawSetApplication] = useObjectState<Application>({
    selectedCourses: [],
    showMeridian: true,
    navbarCollapsed: false,
    theme: 'light',
    seenDisclaimer: false,
  });

  const refreshSchedule = useCallback(async () => {
    setLoading(true);
    const newSched = await pullSchedule();
    setSchedule(newSched);
    setLoading(false);
  }, []);

  // Initial kickoff to pull schedule
  useEffect(() => {
    // TODO: Handle "Calling setState synchronously within an effect can trigger cascading renders" error
    // This sounds rather critical to fix
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSchedule();

    const existingPreferences = localStorage.getItem('preferences');
    if (existingPreferences) {
      rawSetApplication(JSON.parse(existingPreferences) as Application);
    }
  }, [rawSetApplication, refreshSchedule]);

  // Watch and update user preferences
  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(application));
  }, [application]);

  return (
    <ApplicationContext.Provider value={{ application, setApplication }}>
      <SchedulerContext.Provider value={{ schedule, refreshSchedule }}>
        <a href="#main" className="sr-only">
          Skip to main content
        </a>
        <Disclaimer />
        <NavBar />
        <LoadingContext.Provider value={loading}>
          <InnerAppContainer />
        </LoadingContext.Provider>
      </SchedulerContext.Provider>
    </ApplicationContext.Provider>
  );
};

const InnerAppContainer: FC = () => {
  const loading = useContext(LoadingContext);
  if (loading) {
    return (
      <main className="position-absolute top-50 start-50 translate-middle text-center">
        <Spinner>
          <span className="sr-only">Loading...</span>
        </Spinner>
        <div>The WPI Planner is loading. If this takes too long, check your connection.</div>
      </main>
    );
  }

  return (
    <Container tag="main" id="main" fluid>
      <Routes>
        <Route index element={<CoursesPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/times" element={<TimesPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
      </Routes>
    </Container>
  );
};
