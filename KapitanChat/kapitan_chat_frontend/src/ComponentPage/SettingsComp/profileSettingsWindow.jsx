import { useEffect, useState } from "react";
import { useAuth } from "../../Provider/AuthProvider";
import empty_profile from '../../assets/empty-profile.png' 

const ProfileSettingsWindow = () => {
    const { profileSettingsShow, setProfileSettingsShow, UserApi, FileApi , me, setMe, getImageHash, getImage } = useAuth();

    const [bio, setBio] = useState(null);
    // const [phoneNumber, setPhoneNumber] = useState(null);
    const [file, setFile] = useState(null);
    const [profileImageId, setProfileImageId] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [isImagePending, setIsImagePending] = useState(false);

    useEffect(() => {
        const profile = me.profile;

        if(profile){
            setBio(me.profile.bio || null);
            // setPhoneNumber(me.profile.phone_number || null);
            
            async function WaitImage(){
                console.log('Waiting for image...');
                const url = await getImage(me.profile.profile_picture_id);
                setProfileImage(url);
            }
            WaitImage();
            
        }

        console.log('Bio and number:', bio);
        
    }, [me])

    function handleSubmit(e){
        async function submitChange(){
            const requestData = {};
            
            if(isImagePending){
                console.log("WAIT. YOUR PROFILE PICTURE IS STILL PENDING");
                return
            }

            if(profileImageId != null && profileImageId != me.profile.profile_picture_id)
                requestData.profile_picture_id = profileImageId;

            if(bio != null && bio != me.profile.bio)
                requestData.bio = bio;
            
            // if(phoneNumber != null && phoneNumber != me.profile.phone_number)
            //     requestData.phone_number = phoneNumber

            const response = await UserApi().profilePATCH(requestData);
            console.log('Response:', response);

            const updated = await UserApi().getMe();
            setMe(updated);
        }
        submitChange();
    }

    async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        console.log("Selected:", file);

        const hash = await getImageHash(file);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("hash", hash);

        try {
            setIsImagePending(true);
            const response = await FileApi().post(formData);
            console.log("Uploaded:", response);
            setProfileImageId(response.id);
            setIsImagePending(false);
        } catch (error) {
            console.error("Upload error:", error);
        }
    }

    return ( 
        <div 
            className="profile-settings-window"
            style={{
                display: (profileSettingsShow) ? "flex" : "none"
            }}
        >
            <form
                className="profile-settings-form"
                onSubmit={handleSubmit}
            >

                <img src={profileImage || empty_profile} alt="" className="profile-settings-profile-picture"/>

                <input 
                    type="file" 
                    className="profile-settings-file"
                    onChange={handleFileSelect}
                />

                <textarea
                    type="text" 
                    className="bio-input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Your biography"
                />

                {/* <input 
                    type="text" 
                    className="phone-number-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Your Phone Number"
                /> */}

                <input type="submit" />

                <button className="about-exit" onClick={(e) => {
                    e.preventDefault();
                    setProfileSettingsShow(false);
                }}>🗙</button>
            </form>
        </div>
     );
}
 
export default ProfileSettingsWindow;