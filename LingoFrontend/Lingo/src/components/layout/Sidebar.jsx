import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiPlus, 
  FiSidebar, 
  FiBell, 
  FiLogOut, 
  FiChevronDown, 
  FiChevronUp,
  FiUser
} from 'react-icons/fi';
import { 
  HiOutlineBookOpen, 
  HiOutlineTrophy, 
  HiOutlineChevronUpDown 
} from 'react-icons/hi2';
import { 
  MdOutlineVideoLibrary, 
  MdOutlineQueueMusic, 
  MdOutlineTranslate,
  MdHistory
} from 'react-icons/md';
import { BsRobot } from 'react-icons/bs';
import CreateVideoModal from '../common/CreateVideoModal';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getInitials = (username, email) => {
    const raw = username || (email ? email.split('@')[0] : 'U');
    const parts = raw.split(/[_\s.-]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.substring(0, 2).toUpperCase();
  };

  const displayName = user?.username || (user?.email ? user.email.split('@')[0] : 'Learner');

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-18' : 'w-64'
      } bg-white border-r border-zinc-200/90 flex flex-col h-screen sticky top-0 shrink-0 select-none font-['Plus_Jakarta_Sans',sans-serif] text-zinc-700 z-30 transition-all duration-300 ease-in-out`}
    >
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5">
              <img 
                src="/notion-logo-svgrepo-com.svg" 
                alt="LingoSync Logo" 
                className="w-7 h-7 object-contain"
              />
              <span className="font-bold text-base text-zinc-900 tracking-tight">
                Lingo<span className="text-zinc-500 font-normal">Sync</span>
              </span>
            </div>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-[5px] text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Thu gọn Sidebar"
            >
              <FiSidebar className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 rounded-[5px] hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Bấm để mở rộng Sidebar"
          >
            <img 
              src="/notion-logo-svgrepo-com.svg" 
              alt="LingoSync Logo" 
              className="w-7 h-7 object-contain"
            />
          </button>
        )}
      </div>

      <div className="px-3 pb-3">
        {isCollapsed ? (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center p-2 rounded-[5px] border border-emerald-500 hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer shadow-2xs"
            title="Create Lesson"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[5px] border border-emerald-500/80 hover:bg-emerald-50/50 text-emerald-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-5 h-5 rounded-[4px] border border-emerald-500 flex items-center justify-center text-emerald-600 bg-white">
              <FiPlus className="w-3.5 h-3.5" />
            </div>
            <span>Create</span>
          </button>
        )}
      </div>

      <div className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div>
          {isCollapsed ? (
            <div className="space-y-1">
              <NavLink
                to="/lessons"
                title="Lessons"
                className={({ isActive }) =>
                  `flex items-center justify-center p-2 rounded-[5px] text-xs transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`
                }
              >
                <MdOutlineVideoLibrary className="w-4 h-4" />
              </NavLink>

              <NavLink
                to="/playlists"
                title="Playlists"
                className={({ isActive }) =>
                  `flex items-center justify-center p-2 rounded-[5px] text-xs transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`
                }
              >
                <MdOutlineQueueMusic className="w-4 h-4" />
              </NavLink>

              <NavLink
                to="/vocabulary"
                title="Vocabulary"
                className={({ isActive }) =>
                  `flex items-center justify-center p-2 rounded-[5px] text-xs transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`
                }
              >
                <MdOutlineTranslate className="w-4 h-4" />
              </NavLink>
            </div>
          ) : (
            <>
              <button
                onClick={() => setLibraryOpen(!libraryOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-xs font-semibold transition-colors cursor-pointer ${
                  ['/lessons', '/playlists', '/vocabulary', '/'].some(p => location.pathname === p)
                    ? 'bg-zinc-100 text-zinc-900 font-bold'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HiOutlineBookOpen className="w-4 h-4 text-zinc-600" />
                  <span>Library</span>
                </div>
                {libraryOpen ? (
                  <FiChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <FiChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {libraryOpen && (
                <div className="pl-6 pr-1 pt-1 space-y-0.5">
                  <NavLink
                    to="/lessons"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                      }`
                    }
                  >
                    <MdOutlineVideoLibrary className="w-3.5 h-3.5" />
                    <span>Lessons</span>
                  </NavLink>

                  <NavLink
                    to="/playlists"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                      }`
                    }
                  >
                    <MdOutlineQueueMusic className="w-3.5 h-3.5" />
                    <span>Playlists</span>
                  </NavLink>

                  <NavLink
                    to="/vocabulary"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs transition-colors ${
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                      }`
                    }
                  >
                    <MdOutlineTranslate className="w-3.5 h-3.5" />
                    <span>Vocabulary</span>
                  </NavLink>
                </div>
              )}
            </>
          )}
        </div>

        <NavLink
          to="/lingo-ai"
          title="LingoAI"
          className={({ isActive }) =>
            `flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            } rounded-[5px] text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-zinc-100 text-zinc-900 font-bold'
                : 'text-zinc-700 hover:bg-zinc-50'
            }`
          }
        >
          <BsRobot className="w-4 h-4 text-indigo-600 shrink-0" />
          {!isCollapsed && (
            <>
              <span>LingoAI</span>
              <span className="ml-auto px-1.5 py-0.5 rounded-[3px] bg-indigo-50 text-indigo-600 text-[9px] font-bold border border-indigo-100">
                Writing
              </span>
            </>
          )}
        </NavLink>

        <div className="pt-2">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Profile & Practice
            </div>
          )}
          <div className="space-y-0.5">
            <NavLink
              to="/profile"
              title="My Profile"
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5'
                } rounded-[5px] text-xs transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`
              }
            >
              <FiUser className="w-4 h-4 text-zinc-500 shrink-0" />
              {!isCollapsed && <span>My Profile</span>}
            </NavLink>

            <NavLink
              to="/challenges"
              title="Challenges"
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-1.5'
                } rounded-[5px] text-xs transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`
              }
            >
              <HiOutlineTrophy className="w-4 h-4 text-amber-500 shrink-0" />
              {!isCollapsed && <span>Challenges</span>}
            </NavLink>
          </div>
        </div>

        <div className="pt-3">
          {isCollapsed ? (
            <button
              title="Activities"
              className="w-full flex items-center justify-center p-2 rounded-[5px] text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <MdHistory className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setActivitiesOpen(!activitiesOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-[5px] bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/60 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MdHistory className="w-4 h-4 text-zinc-600" />
                  <span>Activities</span>
                </div>
                <HiOutlineChevronUpDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {activitiesOpen && (
                <div className="mt-1 px-1">
                  <NavLink
                    to="/lessons"
                    className="flex items-center gap-2.5 p-2 rounded-[5px] hover:bg-zinc-50 transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-[4px] bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                      1a
                    </div>
                    <p className="text-xs text-zinc-700 truncate font-medium group-hover:text-zinc-900">
                      1a - Mike Is a Cook, Part 1
                    </p>
                  </NavLink>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-zinc-200/90 relative">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2.5 p-1 rounded-[5px] hover:bg-zinc-100 transition-colors text-left ${
              isCollapsed ? '' : 'flex-1 min-w-0 mr-1'
            } cursor-pointer`}
            title={displayName}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-zinc-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#E5D7B7] text-[#5C4D2E] font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials(user?.username, user?.email)}
              </div>
            )}
            {!isCollapsed && (
              <>
                <span className="text-xs font-semibold text-zinc-800 truncate">
                  {displayName}
                </span>
                <HiOutlineChevronUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-auto" />
              </>
            )}
          </button>

          {!isCollapsed && (
            <button 
              className="p-2 rounded-[5px] text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <FiBell className="w-4 h-4" />
            </button>
          )}
        </div>

        {showUserMenu && (
          <div className={`absolute bottom-14 ${isCollapsed ? 'left-2 w-48' : 'left-3 right-3'} bg-white border border-zinc-200 rounded-[5px] p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150`}>
            <div className="px-2.5 py-1.5 border-b border-zinc-100 mb-1">
              <p className="text-xs font-semibold text-zinc-900 truncate">{displayName}</p>
              <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>

      <CreateVideoModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </aside>
  );
};

export default Sidebar;
