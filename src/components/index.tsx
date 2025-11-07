import React, { FC, ReactNode } from 'react';
import { Button, Input } from 'reactstrap';
import { CourseTime } from '../models/Schedule';
import { useApp } from '../providers';

export const BSIcon: FC<{ readonly name: string }> = ({ name }) => <i className={`bi ${name}`} />;
/**
 * The props for utilizing {@Link CheckboxButton}
 *
 * @property {ReactNode} children The ReactNode to be placed as the content of the Button
 * @property {boolean} disabled Whether or not the input is disabled
 * @property {boolean} outline Whether or not the button is outlined
 * @property {string} color The Bootstrap color to apply to the Button
 * @property {string} id The id to use for the input. If none is provided, a random one will be used as it is required for the Input-Label relationship.
 * @property {string} buttonClasses Extra CSS classes to add to the button/label
 * @property {string} inputClasses Extra CSS classes to add to the input
 * @property {React.ChangeEventHandler<HTMLInputElement>} onChange The input change handler callback
 */
interface CheckboxButtonProps {
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly outline?: boolean;
  readonly color?: string;
  readonly id?: string;
  readonly buttonClasses?: string;
  readonly inputClasses?: string;
  readonly onChange?: React.ChangeEventHandler<HTMLInputElement>;
  readonly ariaLabel?: string;
}

/**
 * React Component for having a Checkbox styled Button
 * @param {CheckboxButtonProps} props Component properties
 * @returns Input and Label tag that accepts Button properties
 */
export const CheckboxButton: FC<CheckboxButtonProps> = ({
  children,
  disabled,
  outline,
  id,
  color,
  buttonClasses,
  inputClasses,
  onChange,
  ariaLabel,
}) => {
  const idSuffix = id ?? crypto.randomUUID();
  return (
    <>
      <Input
        onChange={onChange}
        disabled={disabled}
        id={`checkbox-${idSuffix}`}
        type="checkbox"
        className={`btn-check${inputClasses ? ` ${inputClasses}` : ``}`}
        aria-labelledby={ariaLabel ? `label-${idSuffix}` : undefined}
      />

      <Button
        tag="label"
        htmlFor={`checkbox-${idSuffix}`}
        id={`label-${idSuffix}`}
        outline={outline}
        color={color}
        className={buttonClasses}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {children}
      </Button>
    </>
  );
};

interface TimeProps {
  time: CourseTime;
}

/**
 * Provides a correctly rendered time for a course based on user preferences
 * @param {TimeProps} props Props object containing a {@link CourseTime} object
 * @returns A React Fragment containing the rendered time
 */
export const Time: FC<TimeProps> = ({ time }: TimeProps) => {
  const { showMeridian } = useApp();

  const hour = time.hour <= 12 ? time.hour : showMeridian ? time.hour % 12 : time.hour;

  return (
    <>
      {hour < 10 && !showMeridian ? `0${hour}` : hour}:
      {time.minute < 10 ? `0${time.minute}` : time.minute}
      {showMeridian && hour < 12 ? ' AM' : ' PM'}
    </>
  );
};

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly children?: ReactNode;
  readonly gap?: 1 | 2 | 3 | 4 | 5;
  readonly className?: string;
}

interface InnerStackProps extends StackProps {
  readonly stackStyle: 'vstack' | 'hstack';
}

const InnerStack: FC<InnerStackProps> = ({
  stackStyle,
  gap,
  children,
  className,
  ...attributes
}) => {
  return (
    <div
      {...attributes}
      className={`${stackStyle}${gap ? ` gap-${gap}` : ``}${className ? ` ${className}` : ``}`}
    >
      {children}
    </div>
  );
};

export const HorizontalStack: FC<StackProps> = (props) => {
  return <InnerStack stackStyle="hstack" {...props} />;
};

export const VerticalStack: FC<StackProps> = (props) => {
  return <InnerStack stackStyle="vstack" {...props} />;
};
