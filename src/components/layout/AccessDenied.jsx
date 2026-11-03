import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getRoleLandingRoute } from '../../utils/permissions';

export const AccessDenied = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  useEffect(() => {
    // When access is not provided, do not display this restricted error view.
    // Instead, immediately redirect the user to their role-appropriate dashboard.
    const target = currentUser ? getRoleLandingRoute(currentUser.role) : '/login';
    navigate(target || '/dashboard', { replace: true });
  }, [currentUser, navigate]);

  return null;
};
