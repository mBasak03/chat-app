import { useState } from "react"
import { useAuthContext } from "../context/AuthContext"
import toast from "react-hot-toast"


const useSignup= ()=>{
    const [loading, setLoading]= useState(false)
    const {setAuthUser}= useAuthContext()
    interface SignupInputs{
        fullName: string,
        username: string,
        password: string,
        confirmPassword: string,
        gender: string
    }
    const signUp= async(inputs: SignupInputs)=>{
        try{
            setLoading(true);
            const res= await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "content-Type": "application/json",
                },
                body: JSON.stringify(inputs)
            })
            const data= await res.json();
            if(!res.ok){
                throw new Error(data.error.message);
            }
            setAuthUser(data)
            toast.success("Your account is created successfullly")
        }catch(error: any){
            toast.error("Please fill all the details carefully");
        }
        finally{
            setLoading(false)
        }
    }
    return {loading, signUp}
}
export default useSignup