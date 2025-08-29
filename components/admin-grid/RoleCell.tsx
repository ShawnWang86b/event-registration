type RoleCellProps = {
  value: string;
  isAdmin: (role: string) => boolean;
};

export const RoleCell = ({ value, isAdmin }: RoleCellProps) => {
  const role = value;
  const isAdminUser = isAdmin(role);

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isAdminUser
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {role}
    </span>
  );
};
