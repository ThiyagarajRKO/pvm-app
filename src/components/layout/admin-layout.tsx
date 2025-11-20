'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import {
  LayoutDashboard,
  Users,
  Building2,
  BedDouble,
  Calendar,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Upload,
  UserCheck,
  MessageSquare,
  FileText,
  Monitor,
  Shield,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  AlertTriangle,
  User,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  Briefcase,
  DollarSign,
  Cog,
  MapPin,
  Car,
  Package,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Mail,
  Archive,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationSubgroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
  subgroups?: NavigationSubgroup[];
}

interface NavigationGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
  subgroups?: NavigationSubgroup[];
}

const navigationGroups: NavigationGroup[] = [
  {
    name: 'Records',
    icon: FileText,
    items: [
      {
        name: 'Archived',
        href: '/records/archived',
        icon: Archive,
      },
      {
        name: 'Active',
        href: '/records/active',
        icon: CheckCircle,
      },
      {
        name: 'Big',
        href: '/records/big',
        icon: Star,
      },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutComponent({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set()
  );
  const [expandedSubgroups, setExpandedSubgroups] = React.useState<Set<string>>(
    new Set([])
  );
  const [initialized, setInitialized] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const navigationRef = React.useRef<HTMLElement>(null);
  const scrollPositionRef = React.useRef<number>(0);
  const pathname = usePathname();
  const { session, impersonating, exitImpersonation, logout } = useAuth();

  // Store scroll position before each render
  React.useLayoutEffect(() => {
    if (navigationRef.current) {
      scrollPositionRef.current = navigationRef.current.scrollTop;
    }
  });

  // Restore scroll position after each render
  React.useLayoutEffect(() => {
    if (navigationRef.current && scrollPositionRef.current > 0) {
      navigationRef.current.scrollTop = scrollPositionRef.current;
    }
  });

  const isItemActive = (itemHref: string) => {
    // An item is active if:
    // 1. It's an exact match, OR
    // 2. The pathname starts with the href followed by '/', AND
    // 3. No more specific item exists that also matches
    const isExactMatch = pathname === itemHref;
    const isParentMatch = pathname.startsWith(itemHref + '/');

    if (isExactMatch) return true;
    if (!isParentMatch) return false;

    // Check if there's a more specific item that should be active instead
    // For example, if we're on /pandit-partners/verification, don't highlight /pandit-partners
    const pathSegments = pathname.split('/').filter(Boolean);
    const hrefSegments = itemHref.split('/').filter(Boolean);

    // If the current path has more segments than the item href, there might be a more specific item
    if (pathSegments.length > hrefSegments.length) {
      // Check if any navigation item has a more specific href that matches exactly
      const moreSpecificExists = navigationGroups.some((group) => {
        return (
          group.items.some((item) => {
            return (
              item.href === pathname && item.href.startsWith(itemHref + '/')
            );
          }) ||
          group.subgroups?.some((subgroup) =>
            subgroup.items.some((item) => {
              return (
                item.href === pathname && item.href.startsWith(itemHref + '/')
              );
            })
          )
        );
      });

      return !moreSpecificExists;
    }

    return true;
  };

  // Function to find which groups and subgroups should be expanded based on current path
  const findActiveNavigationItems = React.useCallback(() => {
    const activeGroups = new Set<string>();
    const activeSubgroups = new Set<string>();

    const findInSubgroup = (
      subgroup: NavigationSubgroup,
      groupName: string
    ): boolean => {
      // Check if any item in this subgroup is active
      const hasActiveItem = subgroup.items.some((item) =>
        isItemActive(item.href)
      );

      if (hasActiveItem) {
        activeGroups.add(groupName);
        activeSubgroups.add(subgroup.name);
        return true;
      }

      // Check nested subgroups recursively
      if (subgroup.subgroups) {
        for (const nestedSubgroup of subgroup.subgroups) {
          if (findInSubgroup(nestedSubgroup, groupName)) {
            activeGroups.add(groupName);
            activeSubgroups.add(subgroup.name);
            return true;
          }
        }
      }

      return false;
    };

    for (const group of navigationGroups) {
      // Check main group items
      const hasActiveMainItem = group.items.some((item) =>
        isItemActive(item.href)
      );

      if (hasActiveMainItem) {
        activeGroups.add(group.name);
        continue;
      }

      // Check subgroups
      if (group.subgroups) {
        for (const subgroup of group.subgroups) {
          findInSubgroup(subgroup, group.name);
        }
      }
    }

    return { activeGroups, activeSubgroups };
  }, [pathname]);

  // Initialize expanded state based on current pathname
  React.useEffect(() => {
    if (!initialized) {
      const { activeGroups, activeSubgroups } = findActiveNavigationItems();
      activeGroups.add('Records');
      setExpandedGroups(activeGroups);
      setExpandedSubgroups(activeSubgroups);
      setInitialized(true);
    }
  }, [findActiveNavigationItems, initialized]);

  // Removed all scroll position logic to prevent any interference

  // Disabled automatic expansion on pathname changes to prevent scroll effects
  // Only expand items on initial load, then let user manually control the navigation

  // Removed automatic scrolling to prevent jerky movements
  // Users can manually scroll to see their active items

  React.useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    await logout(true);
  };

  // Removed scroll position functions to eliminate jerky scroll behavior

  // Removed scrollToActiveItem function to prevent jerky scroll behavior

  // Removed handleNavigationClick to prevent any side effects

  // Removed scroll restoration effect to prevent jerky movements

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    const newExpandedSubgroups = new Set(expandedSubgroups);

    if (newExpanded.has(groupName)) {
      // If the group is already expanded, close it and its subgroups
      newExpanded.delete(groupName);
      // Also close any subgroups that belong to this group
      const group = navigationGroups.find((g) => g.name === groupName);
      if (group?.subgroups) {
        group.subgroups.forEach((subgroup) => {
          newExpandedSubgroups.delete(subgroup.name);
          // Close nested subgroups recursively
          const closeNestedSubgroups = (sg: NavigationSubgroup) => {
            if (sg.subgroups) {
              sg.subgroups.forEach((nested) => {
                newExpandedSubgroups.delete(nested.name);
                closeNestedSubgroups(nested);
              });
            }
          };
          closeNestedSubgroups(subgroup);
        });
      }
    } else {
      // Close all other groups (accordion behavior)
      newExpanded.clear();
      newExpandedSubgroups.clear();

      // Open the selected group
      newExpanded.add(groupName);
    }

    setExpandedGroups(newExpanded);
    setExpandedSubgroups(newExpandedSubgroups);
  };

  const toggleSubgroup = (
    subgroupName: string,
    parentGroupName?: string,
    parentSubgroupName?: string
  ) => {
    const newExpanded = new Set(expandedSubgroups);

    if (newExpanded.has(subgroupName)) {
      // If the subgroup is already expanded, close it
      newExpanded.delete(subgroupName);
    } else {
      // Close all other subgroups at the same level (siblings)
      if (parentSubgroupName) {
        // If this is a nested subgroup, find its parent subgroup and close siblings
        const findAndCloseSiblings = (
          groups: NavigationGroup[],
          targetParentName: string,
          targetSubgroupName: string
        ) => {
          for (const group of groups) {
            if (group.subgroups) {
              for (const subgroup of group.subgroups) {
                if (subgroup.name === targetParentName && subgroup.subgroups) {
                  // Found the parent subgroup, close all its nested subgroups except the target
                  subgroup.subgroups.forEach((nested) => {
                    if (nested.name !== targetSubgroupName) {
                      newExpanded.delete(nested.name);
                      // Close any nested subgroups recursively
                      const closeNested = (sg: NavigationSubgroup) => {
                        if (sg.subgroups) {
                          sg.subgroups.forEach((n) => {
                            newExpanded.delete(n.name);
                            closeNested(n);
                          });
                        }
                      };
                      closeNested(nested);
                    }
                  });
                  return true;
                }
                // Recursively search in nested subgroups
                if (subgroup.subgroups) {
                  if (
                    findAndCloseSiblings(
                      [group],
                      targetParentName,
                      targetSubgroupName
                    )
                  ) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        };
        findAndCloseSiblings(
          navigationGroups,
          parentSubgroupName,
          subgroupName
        );
      } else if (parentGroupName) {
        // If this is a direct subgroup of a group, close sibling subgroups
        const parentGroup = navigationGroups.find(
          (g) => g.name === parentGroupName
        );
        if (parentGroup?.subgroups) {
          // Close all direct subgroups of this parent group except the target
          parentGroup.subgroups.forEach((subgroup) => {
            if (subgroup.name !== subgroupName) {
              newExpanded.delete(subgroup.name);
              // Also close nested subgroups recursively
              const closeNestedSubgroups = (sg: NavigationSubgroup) => {
                if (sg.subgroups) {
                  sg.subgroups.forEach((nested) => {
                    newExpanded.delete(nested.name);
                    closeNestedSubgroups(nested);
                  });
                }
              };
              closeNestedSubgroups(subgroup);
            }
          });
        }
      }

      // Open the selected subgroup
      newExpanded.add(subgroupName);
    }

    setExpandedSubgroups(newExpanded);
  };

  const isGroupActive = (group: NavigationGroup) => {
    // Check main group items
    const mainItemsActive = group.items.some((item) => isItemActive(item.href));

    // Check subgroup items recursively
    const subgroupItemsActive =
      group.subgroups?.some((subgroup) => isSubgroupActive(subgroup)) || false;

    return mainItemsActive || subgroupItemsActive;
  };

  const isSubgroupActive = (subgroup: NavigationSubgroup): boolean => {
    // Check subgroup items
    const itemsActive = subgroup.items.some((item) => isItemActive(item.href));

    // Check nested subgroups recursively
    const nestedSubgroupsActive =
      subgroup.subgroups?.some((nestedSubgroup) =>
        isSubgroupActive(nestedSubgroup)
      ) || false;

    return itemsActive || nestedSubgroupsActive;
  };

  const SubgroupRenderer = ({
    subgroup,
    level = 0,
    parentGroupName,
    parentSubgroupName,
  }: {
    subgroup: NavigationSubgroup;
    level?: number;
    parentGroupName?: string;
    parentSubgroupName?: string;
  }) => {
    const isSubgroupExpanded = expandedSubgroups.has(subgroup.name);
    const subgroupActive = isSubgroupActive(subgroup);
    const indentClass =
      level > 0 ? `nav-indent-${Math.min(level + 1, 5)}` : 'nav-indent-1';

    return (
      <div className="space-y-1">
        {/* Subgroup Header */}
        <button
          onClick={() =>
            toggleSubgroup(subgroup.name, parentGroupName, parentSubgroupName)
          }
          className={cn(
            'nav-item group flex w-full min-w-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
            subgroupActive
              ? 'bg-primary/10 text-primary'
              : 'text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-300'
          )}
        >
          <subgroup.icon className="nav-icon mr-3 h-4 w-4 flex-shrink-0" />
          <span className="nav-item-text flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {subgroup.name}
          </span>
          {isSubgroupExpanded ? (
            <ChevronDown className="nav-icon ml-2 h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="nav-icon ml-2 h-4 w-4 flex-shrink-0" />
          )}
        </button>

        {/* Subgroup Items and Nested Subgroups */}
        {isSubgroupExpanded && (
          <div className={`${indentClass} animate-fade-in space-y-1`}>
            {subgroup.items.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'nav-item group flex min-w-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-300'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="nav-icon mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="nav-item-text overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Render nested subgroups recursively */}
            {subgroup.subgroups?.map((nestedSubgroup) => (
              <SubgroupRenderer
                key={nestedSubgroup.name}
                subgroup={nestedSubgroup}
                level={level + 1}
                parentGroupName={parentGroupName}
                parentSubgroupName={subgroup.name}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const ImpersonationBanner = () => {
    if (!impersonating || !session?.impersonating) return null;

    return (
      <div className="border-b border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                You are impersonating{' '}
                <span className="font-semibold">
                  {session.impersonating.targetUser.name}
                </span>{' '}
                ({session.impersonating.targetUser.email})
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exitImpersonation}
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-800"
            >
              Exit Impersonation
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-80 transform border-r bg-background transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-white px-4 py-6 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="block flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Building2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="whitespace-nowrap text-lg font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                    PVM
                  </div>
                  <div className="whitespace-nowrap text-sm font-light tracking-wide text-gray-700 dark:text-gray-300">
                    Pawn Shop Management
                  </div>
                </div>
              </div>
            </Link>

            {/* Mobile close button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation - Flexible area with scrollbars */}
        <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
          <nav
            ref={navigationRef}
            className="sidebar-nav custom-scrollbar flex-1 space-y-1 overflow-x-auto overflow-y-auto px-4 py-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: darkMode
                ? 'rgb(75 85 99) rgb(31 41 55)'
                : 'rgb(156 163 175) rgb(243 244 246)',
            }}
          >
            {/* Dashboard - Standalone Item */}
            <Link
              href="/dashboard"
              className={cn(
                'nav-item group flex min-w-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                pathname === '/dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-300'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard className="nav-icon mr-3 h-4 w-4 flex-shrink-0" />
              <span className="nav-item-text overflow-hidden text-ellipsis whitespace-nowrap">
                Dashboard
              </span>
            </Link>

            {/* Grouped Navigation Items */}
            {navigationGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.name);
              const groupActive = isGroupActive(group);

              return (
                <div key={group.name} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={cn(
                      'nav-item group flex w-full min-w-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      groupActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-300'
                    )}
                  >
                    <group.icon className="nav-icon mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="nav-item-text flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                      {group.name}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="nav-icon ml-2 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="nav-icon ml-2 h-4 w-4 flex-shrink-0" />
                    )}
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="animate-fade-in ml-4 space-y-1">
                      {group.items.map((item) => {
                        const isActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              'nav-item group flex min-w-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-300'
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="nav-icon mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="nav-item-text overflow-hidden text-ellipsis whitespace-nowrap">
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}

                      {/* Subgroups */}
                      {group.subgroups?.map((subgroup) => (
                        <SubgroupRenderer
                          key={subgroup.name}
                          subgroup={subgroup}
                          parentGroupName={group.name}
                          parentSubgroupName={undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <header className="fixed-header fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center">
        {/* Mobile menu button - styled like partner-web */}
        <div className="mr-4 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="border-blue-200 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile PVM Branding */}
        <div className="flex items-center space-x-2 md:hidden">
          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="whitespace-nowrap text-base font-bold tracking-tight text-blue-600 dark:text-blue-400">
            PVM
          </div>
        </div>

        <div className="hidden md:block">
          <nav className="flex space-x-1 text-sm text-muted-foreground">
            {pathname
              .split('/')
              .filter(Boolean)
              .map((segment, index, array) => (
                <React.Fragment key={segment}>
                  <span className="capitalize">
                    {segment.replace('-', ' ')}
                  </span>
                  {index < array.length - 1 && <span className="mx-2">/</span>}
                </React.Fragment>
              ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center space-x-4 pr-4">
        {/* Theme toggle button */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* User avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full p-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || 'admin@example.com'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.role?.name || 'Administrator'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <Header />

        <main className="min-h-0 flex-1 overflow-auto pt-16">
          <div className="min-h-full p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again
              to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
