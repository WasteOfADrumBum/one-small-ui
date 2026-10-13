import { HomeIcon, SettingsIcon, TreeView, UserIcon, type TreeNode } from '@onesmall/ui';

// In Next.js, pass linkAs={Link} (from 'next/link') so every href goes through the router.
const pages: TreeNode[] = [
  { id: 'home', label: 'Overview', icon: <HomeIcon />, href: '#components/tree-view' },
  {
    id: 'account',
    label: 'Account',
    icon: <UserIcon />,
    children: [
      { id: 'profile', label: 'Profile', href: '#components/tree-view' },
      { id: 'billing', label: 'Billing', href: '#components/tree-view' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, href: '#components/tree-view' },
];

export default function Example() {
  return (
    <nav aria-label="Account">
      <TreeView
        aria-label="Account sections"
        items={pages}
        defaultExpandedKeys={['account']}
        defaultSelectedKeys={['profile']}
        size="sm"
      />
    </nav>
  );
}
