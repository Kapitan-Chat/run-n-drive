
import ChatList from '../ComponentPage/ChatList';
import Search from '../ComponentPage/Search';
import ChatArea from '../ComponentPage/ChatArea';
import SettingsList from '../ComponentPage/SettingsComp/SettingsList';
import  {useAuth}  from '../Provider/AuthProvider';
import { useState,useEffect,useMemo,useRef } from 'react';
import ProfileSettingsWindow from '../ComponentPage/SettingsComp/profileSettingsWindow';
import Create from './Create';

import { useNavigate } from 'react-router-dom';
import {Panel,PanelGroup,PanelResizeHandle} from 'react-resizable-panels';

import emptyImage from '../assets/empty-profile.png'

export default function Main() {
  // const isAuthenticated = localStorage.getItem("isAuthenticated");

  
  let { 
    chatList, 
    setChatList, 
    isAuthenticated, 
    chatId, 
    setChatId, 
    userSearchActive,
    me,
    getImage
  } = useAuth();

  const navigate = useNavigate();
  if(!isAuthenticated) navigate("/authorization");
  
  const [showMenu, setShowMenu] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);

  const [show, setShow] = useState(false);
  const [chat, setChat] = useState(null);

  const [cntrchatId, setCntrchatId] = useState(null);
  const [secondchat, setSecondChat] = useState(null);

  const [profileImage, setProfileImage] = useState(null);

  const [width, setWidth] = useState(window.innerWidth);

  const widthref = useRef(null);
  
  useEffect(() => {
    const profile = me.profile;

    if(profile){
      async function WaitImage(){
          console.log('Waiting for image... Profile id, image id:', me.id, me.profile.profile_picture_id);
          const url = await getImage(me.profile.profile_picture_id);
          setProfileImage(url);
      }
      WaitImage();
    }
  }, [me])

  useEffect(() => {
    function handleResize() {
      if (widthref.current.offsetWidth <= 768) {
      setShowBackButton(true);
    }
    else{
      setShowBackButton(false);
    }
    }
    handleResize();
    window.addEventListener('resize',handleResize)
    return () => window.removeEventListener('resize',handleResize)
    
  },[])

  const [isGroupActive, setIsGroupActive] = useState();
  const [isChannelActive, setIsChannelActive] = useState();

  //Хуки для анімацій
  const [sidebarTopTranslate, setSidebarTopTranslate] = useState('-40px');
  const [sidebarTopOpacity, setSidebarTopOpacity] = useState(0);
  
  useEffect(() => {
    setTimeout(() => {
      setSidebarTopOpacity(1);
      setSidebarTopTranslate('0');
    }, 1250);
  }, []);

  useEffect(() => {
    console.log('chatId',chatId);
    setChatList((chatList) => chatList.map((chat) => ({ ...chat, active: chat.id === chatId })));
    setChat(chatList.find((chat) => chat.id === chatId));
    
    console.log('chatList', chatList);
    console.log('chat',chat);
  }, [chatId]);

  useEffect(() => {
    console.log('cntrchatId',cntrchatId);
    setChatList((chatList) => chatList.map((chat) => ({ ...chat, active: chat.id === cntrchatId })));
    setSecondChat(chatList.find((chat) => chat.id === cntrchatId));
    console.log('chat',chatList);
  }, [cntrchatId]);

  useEffect(() => {
    if(!chatId && cntrchatId){
      setChatId(cntrchatId);
      setCntrchatId(null);
    }
  }, [chatId,cntrchatId]);

  useEffect( () =>{
    console.log("showmenu",showMenu)
  },[showMenu])



  function handlerChatOpen(){
    if(!chatId && !cntrchatId){
      return ;
    }
    else if(!chatId || !cntrchatId){

      const cId = chatId ? chatId : cntrchatId;
      const c = chatId ? chat : secondchat;
      return(
        <>
        <ChatArea chatId={cId} chat={c} showBackButton={showBackButton} setBackButtonReaction={setShowMenu} />
        </>
      );
    }
    else if(chatId && cntrchatId){
      return(
        <>
        {widthref.current.offsetWidth <= 768 
        ? <ChatArea chatId={chatId} chat={chat} showBackButton={showBackButton} setBackButtonReaction={setShowMenu} /> : 
        <PanelGroup direction='horizontal'>
          <Panel defaultSize={30} minSize={35}>
            <ChatArea chatId={chatId} chat={chat}/>
          </Panel>
          <PanelResizeHandle   className="resize-handle"/>
          <Panel defaultSize={30} minSize={35}>
            <ChatArea chatId={cntrchatId} chat={secondchat}/>
          </Panel>
        </PanelGroup>
        }
        </>
      );
    }
  }


  const chatSectionStyle = useMemo(() => ({
    display:'flex',gap:"10px",flexDirection:'column'
  }),[])

  const appcontstyle = useMemo(() => ({ padding: "20px", display: "flex",gap:"30px" }),[])
 
  return (
    <div className="app-container"  ref={widthref}>

      {/* боковое меню с переченью чатов и кнопка настроек и поиск  */}
      {(showMenu || width > 768) && <section  className={"chat-list-sidebar" +  (showMenu ? " active" : "") } style={chatSectionStyle} >
        <div 
          className='sidebar-top'
          style={{
            transform: `translateY(${sidebarTopTranslate})`,
            opacity: sidebarTopOpacity
          }}
        >
          <SettingsList isShow={show} setShow={setShow} >
              
          </SettingsList>
          
          <button 
            className='sidebar-top-avatar' 
            onClick={() => setShow(!show)}
          >
            <img src={profileImage || emptyImage} alt="profile photo" decoding='async' />
          </button>

          
          <Search isUserSearch={true} />
        </div>
        { (!userSearchActive && !show) && <ChatList  chatList={chatList} setChatId={setChatId} setSecondChatId={setCntrchatId} setShowMenu={setShowMenu}  /> }

        <div className='group-channel-buttons'>
          <button
            onClick={() => setIsGroupActive(true)}
          >Create Group</button>
          <button
            onClick={() => setIsChannelActive(true)}
          >Create Channel</button>#

          {/*кнопки выключения чата */}
          {/* <button onClick={()=>(setChatId(null))}>chat1 is {chatId}</button>
          <button onClick={()=>(setCntrchatId(null))}>chat2 is {cntrchatId}</button> */}
          
        </div>
        
      </section>}

      {(!showMenu || width > 768)&& <>

      {/* содержимое чата click */}
      <section 
        className='current-chat'
        style={{
          backgroundColor: (chatId) ? "transparent" : "rgba(217, 217, 217, 0.35)"
        }}
      >
        
        {
          (chatId) ? (
            handlerChatOpen()
          ) : (
            <div className="empty-chat" >Please, select or start a chat</div>
          )
        }
        
      </section>
      </>}
      
      
    

      <ProfileSettingsWindow />

      {
        (isGroupActive) && <Create groupType={"GROUP"} setActive={setIsGroupActive}/>
      }
      {
        (isChannelActive) && <Create groupType={"CHANNEL"} setActive={setIsChannelActive}/>
      }
    </div>
  );
}
