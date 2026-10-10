import AdminDashboardContent from '../components/admin/AdminDashboardContent';
import RoleGuard from '../components/RoleGuard';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminDashboardContent />
    </RoleGuard>
  );
}
