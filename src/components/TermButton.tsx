import React, { FC, useEffect } from 'react';
import { isSemester, TermPeriod } from '../models/Schedule';
import { CourseBrowserReducerAction } from '../pages/CoursesPage';
import { useCheckboxState } from '../utils';
import { CheckboxButton } from '.';

type TermStatus = 'Available' | 'Waitlisted' | 'Full' | 'Disabled' | 'Unavailable';

interface TermButtonProps {
  readonly term: TermPeriod;
  // green = open seats
  // red = disabled
  // yellow = unavailable (waitlist full)
  // greyed out = unavailable (not offerred)
  // blue = waitlist only
  readonly status?: TermStatus;
  readonly reporter: (status: CourseBrowserReducerAction) => void;
  readonly displayOnly?: boolean;
  readonly disabled?: boolean;
}

const colorReducer = (status?: TermStatus) => {
  switch (status) {
    case 'Available': {
      return 'success';
    }
    case 'Disabled': {
      return 'danger';
    }
    case 'Full': {
      return 'warning';
    }
    case 'Waitlisted': {
      return 'primary';
    }
    default: {
      return 'secondary';
    }
  }
};

export const TermButton: FC<TermButtonProps> = ({
  term,
  status,
  displayOnly,
  disabled,
  reporter,
}) => {
  const [state, setState] = useCheckboxState(false);
  const color = colorReducer(status);
  const isDisabled = disabled ?? status === 'Unavailable';

  const termType = isSemester(term) ? 'Semester' : 'Term';

  // Report changes in usage
  useEffect(() => {
    // reporter(term, state.toString());
  }, [reporter, state, term]);

  if (!status) {
    return null;
  }

  if (displayOnly) {
    return (
      <div
        // TODO: Use screenreader testing to make this all read properly.
        // Remy TODO: add icons to not be color reliant.
        aria-label={isDisabled ? 'Unavailable term' : 'Term'}
        className={`border border-secondary rounded-5 text-black bg-${color}-subtle p-1${isDisabled ? ' btn disabled' : ''}`}
      >
        {term}
      </div>
    );
  }

  return (
    <CheckboxButton
      onChange={setState}
      buttonClasses={`border border-secondary rounded-5 text-black bg-${color}-subtle p-1`}
      disabled={isDisabled}
      ariaLabel={`${term} ${termType} - ${status}`}
    >
      {term}
    </CheckboxButton>
  );
};
