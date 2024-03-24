import React, { useEffect, useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// import { CiMicrophoneOn } from 'react-icons/ci';
import { AiOutlineUser } from 'react-icons/ai';
import { AiTwotoneBug } from "react-icons/ai";


const MODEL_NAME = import.meta.env.VITE_MODEL_NAME;
const API_KEY = import.meta.env.VITE_API_KEY;

interface ChatEntry {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const chat = model.startChat({
  history: [],
  // generationConfig: {
  //   maxOutputTokens: 100,
  // },
});

function ChatRoom() {
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [message, setMessage] = useState('');
  const hasRunRef = useRef(false);

  const handleSendMessage = async () => {
    console.log('message:', message);
    if (!message) {
      return;
    }

    try {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      // 更新 history
      setHistory((prevHistory) => [
        ...prevHistory,
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text }] },
      ]);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }

    async function run() {
      handleSendMessage();
    }

    run();
    hasRunRef.current = true;
  }, []);

  return (
    <main className="bg-[#1e1f20]">
      <div className="chatroomContainer  flex flex-col items-center justify-between min-h-screen px-10 py-5 ">
        <div className=" scrollbar text-white ">
          {/* <ChatRoom /> */}
          <div className='flex flex-col gap-5'>
            {history.map((entry, index) => (
              <div
                key={index}
                className={
                  entry.role === 'user' ? 'user-message' : 'bot-message'
                }
              >
                <div className='flex gap-5'>
                  {entry.role === 'user' && <AiOutlineUser className='w-10 h-10 shrink-0' />}
                  {entry.role === 'model' && <AiTwotoneBug className='w-10 h-10 shrink-0' />}
                  <div className='pt-[5px]'>{entry.parts.map((part) => part.text).join(' ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className=" max-w-[900px] bg-[#282a2c] rounded-lg text-white p-5 w-full flex">
          <input
            type="text"
            className="w-full"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          {/* <CiMicrophoneOn className=" w-8 h-8" /> */}
        </div>
      </div>
    </main>
  );
}

export default ChatRoom;
