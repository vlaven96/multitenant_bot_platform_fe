import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface AgencyIdCaptureProps {
  setAgencyIdApp: React.Dispatch<React.SetStateAction<string>>;
  children: React.ReactNode;
}

const AgencyIdCapture: React.FC<AgencyIdCaptureProps> = ({
  setAgencyIdApp,
  children,
}) => {
  const { agencyId } = useParams<{ agencyId?: string }>();

  useEffect(() => {
    if (agencyId) {
      setAgencyIdApp(agencyId);
      localStorage.setItem('agency_id', agencyId);
    }
  }, [agencyId, setAgencyIdApp]);

  return <>{children}</>;
};

export default AgencyIdCapture;
