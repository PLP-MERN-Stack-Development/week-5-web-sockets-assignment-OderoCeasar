import React, { useState, useEffect } from 'react';
import { BsPlusLg } from 'react-icons/bs';
import { Modal, Box } from '@mui/material';
import { RxCross2 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import { searchUsers } from '../apis/auth';
import { createGroup } from '../apis/chat';
import { fetchChats } from '../redux/chatsSlice';
import { toast } from 'react-toastify';
import Search from './group/Search';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
};

function Group() {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setChatName('');
    setSearch('');
    setSearchResults([]);
    setSelectedUsers([]);
  };

  const handleFormSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleUserClick = (user) => {
    if (!selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleDeleteUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToRemove._id));
  };

  const handleSubmit = async () => {
    if (!chatName.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (selectedUsers.length < 2) {
      toast.error('Select at least 2 users to create a group');
      return;
    }

    try {
      const response = await createGroup({
        chatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      });

      if (!response) {
        toast.error('Failed to create group. Try again.');
        return;
      }

      dispatch(fetchChats());
      toast.success(`${chatName} group created`);
      handleClose();
    } catch (err) {
      console.error('Group creation failed:', err);
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!search.trim()) return setSearchResults([]);

      try {
        setIsLoading(true);
        const { data } = await searchUsers(search);
        setSearchResults(data);
      } catch (err) {
        console.error('Error fetching search results:', err);
        toast.error('Failed to search users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [search]);

  return (
    <>
      <div className="mt-1 transition duration-150 ease-in-out cursor-pointer" onClick={handleOpen}>
        <div className="flex justify-start border-r-2">
          <div className="text-[11px] font-normal tracking-wide flex items-center gap-x-1 bg-[#f6f6f6] text-[#1f2228] py-1 -mb-7 mt-2 px-2">
            New Group <BsPlusLg />
          </div>
        </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <h5 className="text-[18px] text-[#111b21] font-medium text-center">Create A Group</h5>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-y-3 mt-3">
            <input
              type="text"
              name="chatName"
              placeholder="Group Name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              required
              className="border border-[#c4ccd5] text-[13.5px] py-[4px] px-2 w-full"
            />

            <input
              type="text"
              name="users"
              placeholder="Add users"
              value={search}
              onChange={handleFormSearch}
              className="border border-[#c4ccd5] text-[13.5px] py-[4px] px-2 w-full"
            />

            <div className="flex flex-wrap gap-2 mt-1">
              {selectedUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleDeleteUser(user)}
                  className="flex items-center gap-x-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400"
                >
                  {user.name} <RxCross2 />
                </button>
              ))}
            </div>

            <Search
              isLoading={isLoading}
              handleClick={handleUserClick}
              search={search}
              searchResults={searchResults}
            />

            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-[#0086ea] text-white text-[15px] font-medium px-3 py-1 rounded hover:bg-[#0070c0] transition"
              >
                Create
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
}

export default Group;
