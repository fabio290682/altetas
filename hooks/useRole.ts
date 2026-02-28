
import { useState, useEffect } from 'react';
// Fix: Use database from services/database
import { database } from '../services/database';
import { UserRole } from '../types';

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Fix: Use database.getCurrentUser()
    const user = database.getCurrentUser();
    setRole(user.role);
  }, []);

  const isAdmin = role === 'ADMIN';
  const isTecnico = role === 'TECNICO' || role === 'ADMIN';
  const isVisualizador = role === 'VISUALIZADOR';

  return { role, isAdmin, isTecnico, isVisualizador };
}
