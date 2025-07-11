import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { BsEmojiSmile, BsFillEmojiSmileFill } from 'react-icons/bs';
import Model from '../components/Model';
import MessageHistory from '../components/MessageHistory';
import Typing from '../components/ui/Typing';
import Loading from '../components/ui/Loading';
import { fetchMessages, sendMessage } from '../apis/messages';
import { validUser } from '../apis/auth';
import { fetchChats, setNotifications } from '../redux/chatsSlice';
import { getChatName } from '../utils/logics';
import './home.css';
const ENDPOINT = import.meta.env.VITE_APP_URL;


let socket;
let selectedChatCompare;

function Chat(props) {
  const dispatch = useDispatch();
  const { activeChat, notifications } = useSelector((state) => state.chats);
  const activeUser = useSelector((state) => state.activeUser);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);


  const keyDownFunction = async (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && message) {
      setMessage('');
      socket.emit('stop typing', activeChat._id);
      const data = await sendMessage({ chatId: activeChat._id, message });
      socket.emit('new message', data);
      setMessages((prev) => [...prev, data]);
      dispatch(fetchChats());
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
  }, []);

  useEffect(() => {
    if (!socket || !activeUser) return;
    socket.emit('setup', activeUser);
    socket.on('connected', () => setSocketConnected(true));
  }, [activeUser]);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessagesFunc = async () => {
      setLoading(true);
      const data = await fetchMessages(activeChat._id);
      setMessages(data);
      socket.emit('join room', activeChat._id);
      setLoading(false);
    };
    fetchMessagesFunc();
    selectedChatCompare = activeChat;
  }, [activeChat]);

  useEffect(() => {
    socket.on('message recieved', (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chatId._id) {
        if (!notifications.find((n) => n._id === newMessageRecieved._id)) {
          dispatch(setNotifications([newMessageRecieved, ...notifications]));
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
      dispatch(fetchChats());
    });
  }, [notifications, dispatch]);

  useEffect(() => {
    const isValid = async () => {
      const data = await validUser();
      if (!data?.user) {
        window.location.href = '/login';
      }
    };
    isValid();
  }, []);


  
  if (loading) {
    return (
      <div className={props.className}>
        <Loading />
      </div>
    );
  }

  return (
    <>
      {activeChat ? (
        <div className={props.className}>
          <div className='flex justify-between items-center px-5 bg-white w-full'>
            <div className='flex items-center gap-x-2'>
              <div className='flex flex-col'>
                <h5 className='text-lg text-gray-800 font-bold tracking-wide'>
                  {getChatName(activeChat, activeUser)}
                </h5>
              </div>
            </div>
            <Model />
          </div>

          <div className='scrollbar-hide w-full h-[70vh] md:h-[66vh] lg:h-[69vh] flex flex-col overflow-y-scroll p-4'>
            <MessageHistory typing={isTyping} messages={messages} />
            <div className='ml-7 -mb-10'>{isTyping && <Typing width='100' height='100' />}</div>
          </div>

          <div className='absolute left-[31%] bottom-[8%]'>
            {showPicker && (
              <Picker data={data} onEmojiSelect={(e) => setMessage((prev) => prev + e.native)} />
            )}

            <div className='border border-gray-400 px-6 py-3 w-[360px] md:w-[350px] lg:w-[400px] rounded-t-xl'>
              <form onKeyDown={keyDownFunction} onSubmit={(e) => e.preventDefault()}>
                <input
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (!socketConnected) return;
                    if (!typing) {
                      setTyping(true);
                      socket.emit('typing', activeChat._id);
                    }
                    const lastTime = new Date().getTime();
                    const time = 3000;
                    setTimeout(() => {
                      const timeNow = new Date().getTime();
                      if (timeNow - lastTime >= time && typing) {
                        socket.emit('stop typing', activeChat._id);
                        setTyping(false);
                      }
                    }, time);
                  }}
                  className='focus:outline-none w-full bg-gray-100'
                  type='text'
                  name='message'
                  placeholder='Enter message'
                  value={message}
                />
              </form>
            </div>

            <div className='border-x border-b border-gray-400 bg-gray-100 px-6 py-3 w-[360px] md:w-[350px] lg:w-[400px] rounded-b-xl'>
              <div className='flex justify-between items-start'>
                <div className='cursor-pointer' onClick={() => setShowPicker(!showPicker)}>
                  {showPicker ? (
                    <BsFillEmojiSmileFill className='w-5 h-5 text-yellow-400' />
                  ) : (
                    <BsEmojiSmile className='w-5 h-5' />
                  )}
                </div>
                <button
                  onClick={keyDownFunction}
                  className='bg-gray-100 border-2 border-gray-300 text-sm px-2 py-1 text-gray-600 font-medium rounded-md -mt-1'
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={props.className}>
          <div className='relative'>
            <div className='absolute top-[40vh] left-[44%] flex flex-col items-center gap-y-3'>
              <img
                className='w-[50px] h-[50px] rounded-full'
                alt='User profile'
                src={activeUser.profilePic}
              />
              <h3 className='text-gray-900 text-xl font-medium'>
                Welcome <span className='text-green-700 font-bold'>{activeUser.name}</span>
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;