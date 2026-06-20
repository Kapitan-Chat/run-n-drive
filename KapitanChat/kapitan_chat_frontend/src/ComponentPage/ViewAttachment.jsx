const ViewAttachment = ({type, src, show}) => {
    const [isShow, setShow] = show;

    return ( 
        <div 
            className="view-attachment-container" 
            style={{
                display: (isShow) ? 'flex' : 'none'
            }}    
        >
            {
                (type == 'video') ? <video controls className="view-attachment-content" src={src}></video> : <img src={src} className="view-attachment-content" />
            }
            <button className="about-exit" onClick={() => setShow(false)}>🗙</button>
        </div>
     );
}
 
export default ViewAttachment;