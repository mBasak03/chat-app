import { useState } from "react"
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";


const useLogin= ()=>{
    const [loading, setLoading]= useState(false);
    const {setAuthUser}= useAuthContext()
    const login= async(username: string, password: string)=>{
        setLoading(true);
        if(loading) toast.loading("logging in...")
        try{
            const res= await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                     "content-Type": "application/json"
                },
                body: JSON.stringify({username, password})
            })
            const data= await res.json();
            if(!res.ok){
                throw new Error(data.error);
            }
            setAuthUser(data);
            toast.success("You are logged in successfuly")
        }catch(error){
            toast.error("Failed to login")
        }finally{
            setLoading(false);
        };
        
    }
    
    return {loading, login};
}
export default useLogin