import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validUser, searchUsers } from '../apis/auth';
import { setActiveUser } from '../redux/activeUserSlice';
import { setShowNotifications, setShowProfile } from '../redux/profileSlice';
import { fetchChats, setNotifications, setActiveChat } from '../redux/chatsSlice';
import { acessCreate } from '../apis/chat';
import { getSender } from '../utils/logics';
import Chat from './Chat';
import Profile from '../components/Profile';
import Group from '../components/Group';
import Contacts from '../components/Contacts';
import Search from '../components/group/Search';
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';
import { RiNotificationBadgeFill } from 'react-icons/ri';
import { BiNotification } from 'react-icons/bi';
import { IoIosArrowDown } from 'react-icons/io';
import { BsSearch } from 'react-icons/bs';
import './home.css';

function Home() {
  const dispatch = useDispatch();

  const { showProfile, showNotifications } = useSelector(state => state.profile);
  const { notifications } = useSelector(state => state.chats);
  const activeUser = useSelector(state => state.activeUser);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isValid = async () => {
      const res = await validUser();
      const user = res?.user;
      if (user) {
        dispatch(setActiveUser({
          id: user._id,
          email: user.email,
          profilePic: user.profilePic,
          bio: user.bio,
          name: user.name,
        }));
      }
    };
    isValid();
  }, [dispatch]);

  useEffect(() => {
    const searchChange = async () => {
      if (!search) return;
      setIsLoading(true);
      const { data } = await searchUsers(search);
      setSearchResults(data);
      setIsLoading(false);
    };
    searchChange();
  }, [search]);

  const handleSearch = (e) => setSearch(e.target.value);

  const handleClick = async (user) => {
    await acessCreate({ userId: user._id });
    dispatch(fetchChats());
    setSearch("");
  };

  const handleNotificationClick = (notif) => {
    dispatch(setActiveChat(notif.chatId));
    dispatch(setNotifications(notifications.filter(n => n !== notif)));
  };

  return (
    <div className="bg-[#282C35!] scrollbar-hide z-10 h-[100vh] lg:w-[90%] lg:mx-auto overflow-y-hidden shadow-2xl">
      <div className='flex'>
        {!showProfile ? (
          <div className="md:flex md:flex-col min-w-[360px] h-[100vh] bg-[#ffff] relative">

            <div className='h-[61px] px-4 flex items-center justify-between'>
              <h3 className='text-[20px] text-[#1f2228] font-extrabold tracking-wider'>Messages</h3>
              <div className='flex items-center gap-x-3'>
                <button onClick={() => dispatch(setShowNotifications(!showNotifications))}>
                  <NotificationBadge
                    count={notifications.length}
                    effect={Effect.SCALE}
                    style={{ width: "15px", height: "15px", fontSize: "9px" }}
                  />
                  {showNotifications
                    ? <RiNotificationBadgeFill className='w-[6]' style={{ color: "#319268" }} />
                    : <BiNotification className='w-[6]' style={{ color: "#319268" }} />}
                </button>
                <button onClick={() => dispatch(setShowProfile(true))} className='flex items-center gap-x-1'>
                  <img className='w-[28px] h-[28px] rounded-full' src={activeUser?.profilePic} alt="profile" />
                  <IoIosArrowDown className='text-[#616c76] w-[14px] h-[14px]' />
                </button>
              </div>
              {showNotifications && (
                <div className='absolute top-10 -left-32 z-10 w-[240px] bg-[#fafafa] px-4 py-2 shadow-2xl text-[13px] tracking-wide'>
                  {!notifications.length && "No new messages"}
                  {notifications.map((n, i) => (
                    <div key={i} onClick={() => handleNotificationClick(n)} className='text-[12.5px] text-black px-2 cursor-pointer'>
                      {n.chatId.isGroup ? `New Message in ${n.chatId.chatName}` : `New Message from ${getSender(activeUser, n.chatId.users)}`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='pt-6 px-4 -mt-6 relative'>
              <form onSubmit={e => e.preventDefault()}>
                <input
                  onChange={handleSearch}
                  className='w-full bg-[#f6f6f6] text-[#111b21] tracking-wider pl-9 py-[8px] rounded-[9px] outline-0'
                  type="text"
                  placeholder="Search"
                />
                <div className='absolute top-[36px] left-[27px]'>
                  <BsSearch className='text-[#c4c4c5]' />
                </div>
              </form>

              <Group />

              {search && (
                <div className='absolute z-10 top-[70px] left-0 w-full h-full bg-white px-4 pt-3 flex flex-col gap-y-3'>
                  <Search
                    searchResults={searchResults}
                    isLoading={isLoading}
                    handleClick={handleClick}
                    search={search}
                  />
                </div>
              )}
            </div>

            <Contacts />
          </div>
        ) : (
          <Profile className="min-w-full sm:min-w-[360px] h-[100vh] bg-[#fafafa] shadow-xl" />
        )}

        <Chat className="chat-page relative lg:w-full h-[100vh] bg-[#fafafa]" />
      </div>
    </div>
  );
}

export default Home;
