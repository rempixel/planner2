import React, { FC } from 'react';
import { Container, ContainerProps } from 'reactstrap';

export const SectionContainer: FC<ContainerProps> = ({ children, ...props }) => (
  <Container
    style={{ height: '95vh', overflowY: 'scroll', }}
    className={props.className ? `p-0 ${props.className}` : `p-0`}
    fluid={true}
    {...props}
  >
    {children}
  </Container>
);
