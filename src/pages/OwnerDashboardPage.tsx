import OwnerDashboardContent from '../components/OwnerDashboardContent';
import RoleGuard from '../components/RoleGuard';

export default function OwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <OwnerDashboardContent />
    </RoleGuard>
  );
}
