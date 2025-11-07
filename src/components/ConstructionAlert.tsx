import React, { FC } from 'react';
import { Alert } from 'reactstrap';

export const ConstructionAlert: FC = () => (
  <Alert className="my-2" fade={false} color="warning">
    This page is still under construction and contains no content.
  </Alert>
);
