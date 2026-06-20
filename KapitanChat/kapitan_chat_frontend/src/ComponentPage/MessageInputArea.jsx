
import { useState,useRef,useEffect } from "react"
import { useAuth } from "../Provider/AuthProvider"

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import emptyFile from '../assets/empty-file.webp'

/**
 * Компонент для ввода сообщения
 * 
 * @param {Function} setlist - функция для обновления списка сообщений
 * @param {number} chatid - идентификатор чата
 * 
 * @returns {React.Component} - компонент для ввода сообщения
 */
export default function MessageInputArea({setlist,chatid, onNewMessage}) {
    const {userid,wsRef,wsError,isEdit,setIsEdit,editMessage,setEditMessage,MessageApi,uploadAttachments} = useAuth();
    const [msg, setmsg] = useState("");
    const fileInputRef = useRef(null);

    const [showEmoji, setShowEmoji] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
      console.log('All selected files:', selectedFiles);
    }, [selectedFiles]);
    
    // отправка сообщения
  const send = (obj) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WS not ready");
      return; 
    }
    ws.send(JSON.stringify(obj));
    console.log("send", obj);
  };

  wsRef.current.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    console.log("onmessage", payload);

    onNewMessage();
    
    if(payload.type === "message" && payload.data.chat.id === chatid){
      console.log("onmessage", payload.data);
    setlist((list) => [...list, payload.data]);
    }
    else if(payload.type == "message_edit" && payload.data.chat.id == chatid){
      console.log("onmessage edit data", payload.data);
    setlist((list) => {
      const updatedList = list.map((item) => {
        if (item.id === payload.data.id) {
          return { ...item, content: payload.data.content,is_edited: true };
        }
        return item;
      });
      return updatedList;
    });
    }
  }
 

  useEffect(() => {
    if(isEdit){
      setmsg(editMessage.content);
    }

  },[isEdit,editMessage]);



/**
 * Обработчик события отправки сообщения
 * 
 * @param {Event} e - событие отправки формы
 * 
 * @returns {void}
 * 
 * @throws {Error} - если возникла ошибка при отправке сообщения
 */
    async function MessageHandler(e){
      if(!isEdit){
        e.preventDefault();
        if(msg.length > 0 || selectedFiles.length > 0){
          const response = await uploadAttachments(selectedFiles);
          try{
            send({
              type: 'message',
              data: {
                  user_id: userid,
                  chat_id: chatid,
                  content: msg,
                  attachments: response
              }
            })
            setShowEmoji(false);
            setmsg('');
            setSelectedFiles([]);
          }
          catch(e){
              console.log(e);
          }
        }
      }
      else if(isEdit){
        e.preventDefault();
        if(msg.length > 0 || selectedFiles.length > 0){
          const response = await uploadAttachments(selectedFiles);
          try{
          send({
            type: 'message_edit',
            data: {
                id: editMessage.id,
                userid: userid,
                chatid: chatid,
                content: msg,
                attachments:response
            }
          })
          setShowEmoji(false);
          setmsg('');
          setIsEdit(false);
          setEditMessage({});

          setSelectedFiles([]);
        }
        catch(e){
            console.log(e);
        }
      }
      }
        
    }

    // очистка полей
    useEffect(() => {
    return () => {
      setmsg('');
      setShowEmoji(false);
      setIsEdit(false);
      setEditMessage({});
    }
  },[chatid])

    function handleKeyDown(e) {
        if (e.key === "Enter") {
          MessageHandler(e);
        }
    }

    function EmojiHandler(data){
      console.log(data);
      setmsg(msg + data.native);
    }

    function isFileInArray(file, filesArray) {
      return filesArray.some(
        (f) =>
          f.name === file.name &&
          f.size === file.size &&
          f.lastModified === file.lastModified
      );
    }

    async function handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      console.log("Selected:", file);
      if(!isFileInArray(file, selectedFiles))
        setSelectedFiles([...selectedFiles, file]);
    }

    return(
        <>
        <div>
            <h1 id="status"></h1>
        </div>
        <div className="message-input-container">
          {
            (selectedFiles.length > 0) && <div className="attachments-container">
              {
                selectedFiles.map((file) => {
                  return <div className="selected-file" style={{backgroundImage: `url(${emptyFile})`}}>
                    {file.name.substring(file.name.lastIndexOf(".") + 1)}
                    <button 
                      className="delete-attachment"
                      onClick={() => {
                        setSelectedFiles(
                          selectedFiles.filter(
                            (deleteFile) => (
                              (deleteFile.name != file.name) && 
                              (deleteFile.size != file.size) && 
                              (deleteFile.lastModified != file.lastModified)
                            )
                          )
                        )
                      }}
                    >❌</button>
                  </div>
                })
              }
            </div>
          }
          <div className="message-input-wrapper">
              
            <button 
              className="icon-btn"
              onClick={() => {
                console.log("btn click", fileInputRef.current)
                fileInputRef.current.click();
              }}
            ><i className="fas fa-paperclip"></i></button>
            <label htmlFor="msg"></label>
            <input 
              type="text" 
              className="message-input" 
              name="message" 
              id="msg" 
              placeholder="Write message..." 
              value={msg} 
              onChange={(e) => setmsg(e.target.value)} 
              onKeyDown={(e) => handleKeyDown(e)}
            />
            <div className="input-actions">
                  
                <div className="emoji-wrapper">
                  {showEmoji && (
                    <div className="emoji-picker">
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji) => EmojiHandler(emoji)}
                      />
                    </div>
                  )}

                  <button
                    className="icon-btn"
                  >
                  <i 
                    className="far fa-smile"
                    onClick={() => {         
                      setShowEmoji((v) => !v);
                    }}
                  ></i>
                  </button>

                  <input 
                    style={{ display: "none" }} 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                </div>

                <button 
                  className="send-button" 
                  onClick={(e) => (MessageHandler(e))}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
          </div>
            </div>

        </>
    )
}