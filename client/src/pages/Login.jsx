import React, { useEffect, useState } from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { googleAuth, loginUser, validUser } from '../apis/auth'
import { Link, useNavigate } from 'react-router-dom'
import { BsEmojiLaughing, BsEmojiExpressionless } from "react-icons/bs"
import { toast } from 'react-toastify'

const defaultData = {
  email: "",
  password: ""
}

function Login() {
  const [formData, setFormData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const pageRoute = useNavigate()

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const formSubmit = async (e) => {
    e.preventDefault()
    if (formData.email.includes("@") && formData.password.length > 6) {
      setIsLoading(true)
      const { data } = await loginUser(formData)
      if (data?.token) {
        localStorage.setItem("userToken", data.token)
        toast.success("Successfully Logged In!")
        pageRoute("/chats")
      } else {
        toast.error("Invalid Credentials!")
        setFormData({ ...formData, password: "" })
      }
      setIsLoading(false)
    } else {
      toast.warning("Provide valid credentials")
      setFormData(defaultData)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true)
      // const decoded = jwtDecode(credentialResponse.credential)
      // const { email, given_name, family_name } = decoded
      const response = await googleAuth({ token: credentialResponse.credential });

      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token)
        pageRoute("/chats")
      }
      
    } catch (error) {
      console.error("Error in handling Google Success", error)
      toast.error("Google Sign-in failed!")
      
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const data = await validUser()
      if (data?.user) {
        window.location.href = "/chats"
      }
    }
    checkUser()
  }, [])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className='bg-[#121418] w-[100vw] h-[100vh] flex justify-center items-center'>
        <div className='w-[90%] sm:w-[400px] h-[450px] mt-20 relative'>
          <div className='absolute -top-5 left-0'>
            <h3 className='text-[25px] font-bold tracking-wider text-[#fff]'>Login</h3>
            <p className='text-[#fff] text-[12px] tracking-wider font-medium'>
              No Account? <Link className='text-[rgba(0,195,154,1)] underline' to="/register">Sign up</Link>
            </p>
          </div>
          <form className='flex flex-col gap-y-3 mt-[12%]' onSubmit={formSubmit}>
            <input className="w-full bg-[#222222] h-[50px] pl-3 text-[#ffff]" onChange={handleOnChange} name="email" type="email" placeholder='Email' value={formData.email} required />
            <div className='relative'>
              <input className='w-full bg-[#222222] h-[50px] pl-3 text-[#ffff]' onChange={handleOnChange} type={showPass ? "text" : "password"} name="password" placeholder='Password' value={formData.password} required />
              <button type='button'>
                {!showPass
                  ? <BsEmojiLaughing onClick={() => setShowPass(true)} className='text-[#fff] absolute top-3 right-5 w-[30px] h-[25px]' />
                  : <BsEmojiExpressionless onClick={() => setShowPass(false)} className='text-[#fff] absolute top-3 right-5 w-[30px] h-[25px]' />
                }
              </button>
            </div>

            <button style={{ background: "linear-gradient(90deg, rgba(0,195,154,1) 0%, rgba(224,205,115,1) 100%)" }} className='w-full h-[50px] font-bold text-[#121418] tracking-wide text-[17px] relative' type='submit'>
              {isLoading ? (
                <div className='absolute -top-[53px] left-[27%]'>
                  <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_h9kds1my.json" background="transparent" speed="1" style={{ width: "200px", height: "160px" }} loop autoplay></lottie-player>
                </div>
              ) : (
                <p className='text-[#fff]'>Login</p>
              )}
            </button>

            <p className='text-[#fff] text-center'>/</p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign-In Failed")}
              width={500}
            />
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Login
