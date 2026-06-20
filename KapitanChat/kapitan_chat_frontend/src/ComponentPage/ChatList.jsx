import { useEffect } from "react";
import { useAuth } from "../Provider/AuthProvider";
/**
 * Компонент для отображения списка чатов
 * 
 * @param {array} chatList - список чатов
 * @param {function} setChatId - функция для обновления идентификатора чата
 * 
 * @returns {React.Component} - компонент для отображения списка чатов
 */
    export default function ChatList({
        chatList,
        setChatId,
        isUser=false,
        isNewChat=false, 
        forGroupchat=false,
        setSecondChatId,

        setShowMenu,
    }) {
    const { ChatApi, me, setUserSearchActive, GetChatList, addGroupUsers, setAddGroupUsers, getImage } = useAuth();

    console.log('ChatList:', chatList);

    useEffect(() => {}, [chatList]);

    /**
     * Обработчик клика на чат
     * 
     * @param {React.MouseEvent<HTMLDivElement>} e - событие клика
     * @param {number} chatId - идентификатор чата
     * 
     * @returns {void} - ничего не возвращает
     */
    function handleChatClick(e,chatId, chat) {

        // Логіка створення нового чату
        if(isNewChat && !forGroupchat){
            async function createNewChat(){
                const data = {
                    "type": "DIRECT",
                    "created_by": me.id,
                    "users": [
                        me.id,
                        chat.id
                    ]
                };
                const response = await ChatApi().post(data);
                setUserSearchActive(false);

                const updatedChats = await GetChatList(); 
                setChatId(response.id);
            }
            createNewChat();
        }else if(forGroupchat){
            const existingUsers = addGroupUsers.map((user) => user.id)
            if(!existingUsers.includes(chat.id)) setAddGroupUsers([...addGroupUsers, chat])
        }else{

            // Логіка з другим чатом
            console.log('ctrlKey =', e.ctrlKey);
            if(e.ctrlKey){
                setSecondChatId(chatId);
            }
            else{
                setChatId(chatId);
            }
        }

        
    }

    return (
        <>
        {chatList.length === 0?(<h1 className="no-chats">No chats found</h1>):(
            <div className="chats-container" style={{marginTop: (!isNewChat && !forGroupchat && !isUser) ? "15px" : 0}}>
            {
            chatList.map((chat, i) => (
                <div 
                    className={`chat-item${chat.active ? " active" : ""}`} 
                    key={chat.id} 
                    onClick={(e)=>{handleChatClick(e, chat.id, chat); setShowMenu(false)}}
                    style={{ animationDelay: `${i * 0.15 + 1.5}s` }}

                    
                >
                    
                    <div className="chat-header">
                        <div className="chat-avatar" >
                            {
                                chat.img ? <img src={chat.img} decoding="async" /> : <div>
                                    {
                                        isUser ? (
                                            <h2>{
                                                chat
                                                    .first_name
                                                    .charAt(0)
                                                    .toUpperCase()
                                                
                                                +

                                                (chat.last_name) ? (chat
                                                    .last_name
                                                    .charAt(0)
                                                    .toUpperCase()
                                                ) : ('')
                                                }
                                            </h2>
                                        ) : (
                                            <h2>{chat.name.charAt(0).toUpperCase()+chat.name.charAt(chat.name.length-1).toLowerCase()}</h2>
                                        )
                                    }
                                </div>
                            }
                            
                        
                        </div>
                        <div className="chat-name">{(isUser) ? ( chat.first_name + ' ' + chat.last_name ) : chat.name}</div>
                    </div>
                    { (!isNewChat && !isUser && !forGroupchat) && <div className="chat-preview">{chat.lastMessage ? chat.lastMessage : "MESSAGE PREVIEW"}</div>}
                </div>
            ))}
        </div>
        )

        }
        </>
        
    );
}