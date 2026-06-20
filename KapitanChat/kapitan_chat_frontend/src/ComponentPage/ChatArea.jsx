import MessageInputArea from "./MessageInputArea";
import { useAuth } from "../Provider/AuthProvider";
import { useEffect, useState } from "react";
import Search from "./Search";
import About from "../Main/About";
import ViewAttachment from "./ViewAttachment";
import MessageMenu from "./MessageMenu";

/**
 * Компонент для отображения чата
 * 
 * @param {number} chatId - идентификатор чата
 * @param {object} chat - объект с информацией о чате
 * @param {boolean} showBackButton - true если нужно отображать кнопку назад
 * @param {function} setBackButtonReaction - функция для обновления состояния кнопки назад
 * 
 * @returns {React.Component} - компонент для отображения чата
 */
export default function ChatArea({chatId,chat,showBackButton,setBackButtonReaction}) {

    const [messagelist, setMessagelist] = useState([]);
    const{me,MessageApi,getAttachmentsSrc} = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSerch, setIsSerch] = useState(false);
    const [isMore, setIsMore] = useState(false);
    const [isAbout, setIsAbout] = useState(false);
    const [attachmentType, setAttachmentType] = useState(null);
    const [attachmentSrc, setAttachmentSrc] = useState(null);
    const [isAttachmentView, setIsAttachmentView] = useState(false);
    const [showMessageMenu, setShowMessageMenu] = useState(false);
    const [messageMenuId, setMessageMenuId] = useState(null);
    useEffect(() => {
        if(!chat){
            setLoading(true)
        }

        else 
            setLoading(false);
        
    }, [chat,loading]);


    useEffect(() => {
        setMessagelist([]);
        MessageApi().getList(chatId).then((res) => setMessagelist(res));
        loadMessages();
    },[chatId])
    
    function GetListForSearch(){
        let list = [];

        messagelist.map(item => list.push({name:item.content,user:item.user.username}));

        return list;
    }

    async function loadMessages() {
        const res = await MessageApi().getList(chatId);
        const newMessages = await getAttachmentsSrc(res);
        setMessagelist(newMessages);
        console.log('New messages:', newMessages);
    }
    
/**
 * функция аватра чата
 * если есть изображение, то отображает ее
 * если нет, то отображает имя чата
 * @return {ReactNode} отображение чата
 */
    function Avatar(){
        if (chat.img){
            return <img src={chat.img} className="chat-avatar"/>
        }
        else{
            return <div><h2>{chat.name.charAt(0).toUpperCase()+chat.name.charAt(chat.name.length-1).toLowerCase()}</h2></div>
        }
    }
    

/**
 * функция отображения аватара пользователя
 * если есть изображение, то отображает ее
 * если нет, то отображает имя пользователя
 * @param {object} user - объект с информацией о пользователе
 * @return {ReactNode} отображение аватара пользователя
 */ 
    function UserAvatar(user){
        if (user.img){
            return <img src={user.img} />
        }
        else{
            return <div><p>{user.username.charAt(0).toUpperCase()+user.username.charAt(user.username.length-1).toLowerCase()}</p></div>
        }
    }

    return (
        
        <div className="current-chat-wrapper">
            <div className="sidebar-overlay" id="sidebarOverlay"></div>
            <div 
                className="chat-area"
                style={{
                    height: chat && !((chat.type !== 'CHANNEL') || chat.created_by === me.id) ? '100%' : undefined
                }}
            >

                {loading ? (
                    <h1>LOAD</h1>
                ):
                <>
                
                 <div class="chat-header-area" style={{gap:'10px'}}>
                    
                <div class="chat-user-info">
                    {showBackButton && <div class="back-button" onClick={() =>(setBackButtonReaction(true))}><i class="fas fa-arrow-left"></i></div>}
                    <div className="chat-user-avatar">{Avatar()}</div>
                    <div>
                        <div className="chat-user-name">{chat.name}</div>
                        {/* <div class="chat-user-status">online</div> */}
                    </div>
                </div>
                {isSerch && <Search chatlist={GetListForSearch()}/>}
                <div className="chat-actions">
                    <button onClick={()=>setIsSerch(!isSerch)} className="icon-btn"> {isSerch ? <i className="fa-solid fa-xmark"></i>:<i className="fas fa-search"></i>} </button>
                    
                    <button 
                        className="icon-btn btn btn-danger"
                        onClick={() => {
                            setIsMore(!isMore);
                        }}
                    ><i className="fas fa-ellipsis-v"></i></button>
                </div>
                
            </div>

            
            <div className="messages-container">
                
                {messagelist.map((item)=>{

                    return(
                        <div 
                            key={item.id} 
                            className={'message'+(item.user.id === me.id ? " sent" : " received")}
                             onContextMenu={(e) =>{e.preventDefault();if(e.button == 2) {setShowMessageMenu(true); setMessageMenuId(item.id)}}}
                        >
                            {item.user.id === me.id && messageMenuId === item.id
                            &&
                            <MessageMenu  message={item} showMenu={showMessageMenu} setShowMenu={setShowMessageMenu} OnDelete={()=>{setMessagelist(messagelist.filter((item) => item.id !== messageMenuId))}} />
                            }
                            <div className="message-avatar">{UserAvatar(item.user)}</div>
                            <div className="message-content">
                                <div className="message-text">{item.content}</div>
                                {item.attachments.map((attachment) => {
                                    if(attachment.type.includes('image')){
                                        return (attachment.src) ? <img src={attachment.src} onClick={() => {
                                            setAttachmentType('img');
                                            setAttachmentSrc(attachment.src);
                                            setIsAttachmentView(true);
                                        }}/> : <div className="loading-attachment-visual"></div>
                                    }else if(attachment.type.includes('video')){
                                        return (attachment.src) ? <video
                                            src={attachment.src}
                                            muted
                                            playsinline
                                            disablePictureInPicture
                                            controlsList="nodownload nofullscreen noplaybackrate"
                                            class="video-thumb"
                                            onClick={() => {
                                                setAttachmentType('video');
                                                setAttachmentSrc(attachment.src);
                                                setIsAttachmentView(true);
                                            }}
                                        ></video> : <div className="loading-attachment-visual"></div>
                                    }else if(attachment.type.includes('audio')){
                                        return (attachment.src) ? <audio src={attachment.src}/> : <div className="loading-attachment-audio"></div>
                                    }
                                })}
                                <div className="message-time">{item.created_at.slice(11,19)}</div>
                            </div>
                        </div>
                    )

                })}
                
                
            </div>
                </>}
            
            {/* <!-- Поле ввода сообщения --> */}

            {((chat && chat.type != 'CHANNEL') || (chat && chat.created_by == me.id)) ? <MessageInputArea onNewMessage={loadMessages} setlist={setMessagelist} chatid={chatId} /> : <h2 className="admins-only">You cannot write messages to this channel</h2>}
            </div>
            {(isMore) && (
                <div className="more-menu">
                    <button onClick={() => setIsAbout(!isAbout)}>About</button>
                    <button>Leave chat</button>
                </div>
            )}

            <ViewAttachment type={attachmentType} src={attachmentSrc} show={[isAttachmentView, setIsAttachmentView]}/>
            <About show={[isAbout, setIsAbout]} chatId={chatId} chatContent={chat}/>
        </div>
    );
}
