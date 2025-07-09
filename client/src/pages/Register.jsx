import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {jwtDecode} from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { googleAuth, registerUser, validUser } from '../apis/auth'
import { BsEmojiLaughing, BsEmojiExpressionless } from "react-icons/bs"
import { toast } from 'react-toastify'

const defaultData = {
  firstname: "",
  lastname: "",
  email: "",
  password: ""
}

function Register() {
  const [formData, setFormData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const pageRoute = useNavigate()

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.email.includes("@") && formData.password.length > 6) {
      const { data } = await registerUser(formData)
      if (data?.token) {
        localStorage.setItem("userToken", data.token)
        toast.success("Successfully Registered 😍")
        setIsLoading(false)
        pageRoute("/chats")
      } else {
        setIsLoading(false)
        toast.error("Invalid Credentials!")
      }
    } else {
      setIsLoading(false)
      toast.warning("Provide valid Credentials!")
      setFormData({ ...formData, password: "" })
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential)
      const { email, given_name, family_name } = decoded
      setIsLoading(true)
      const response = await googleAuth({ email, firstname: given_name, lastname: family_name })
      setIsLoading(false)
      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token)
        pageRoute("/chats")
      }
    } catch (err) {
      console.error(err)
      toast.error("Google Login Failed!")
    }
  }

  useEffect(() => {
    const isValid = async () => {
      const data = await validUser()
      if (data?.user) {
        window.location.href = "/chats"
      }
    }
    isValid()
  }, [])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className='bg-[#121418] w-[100vw] h-[100vh] flex justify-center items-center'>
        <div className='w-[90%] sm:w-[400px] h-[450px] mt-10 relative'>
          <div className='absolute -top-7 left-0'>
            <h3 className='text-[25px] font-bold tracking-wider text-[#fff]'>Register</h3>
            <p className='text-[#fff] text-[12px] tracking-wider font-medium'>
              Have Account? <Link className='text-[rgba(0,195,154,1)] underline' to="/login">Sign in</Link>
            </p>
          </div>
          <form className='flex flex-col gap-y-3 mt-[12%]' onSubmit={handleOnSubmit}>
            <div className='flex gap-x-2 w-[100%]'>
              <input onChange={handleOnChange} className='bg-[#222222] h-[50px] pl-3 text-[#fff] w-[49%]' type="text" name="firstname" placeholder='First Name' value={formData.firstname} required />
              <input onChange={handleOnChange} className='bg-[#222222] h-[50px] pl-3 text-[#fff] w-[49%]' type="text" name="lastname" placeholder='Last Name' value={formData.lastname} required />
            </div>
            <input onChange={handleOnChange} className='bg-[#222222] h-[50px] pl-3 text-[#fff]' type="email" name="email" placeholder="Email" value={formData.email} required />
            <div className='relative flex flex-col gap-y-3'>
              <input onChange={handleOnChange} className='bg-[#222222] h-[50px] pl-3 text-[#fff]' type={showPass ? "text" : "password"} name="password" placeholder="Password" value={formData.password} required />
              <button type='button'>
                {!showPass
                  ? <BsEmojiLaughing onClick={() => setShowPass(true)} className='text-[#fff] absolute top-3 right-4 w-[30px] h-[25px]' />
                  : <BsEmojiExpressionless onClick={() => setShowPass(false)} className='text-[#fff] absolute top-3 right-4 w-[30px] h-[25px]' />
                }
              </button>
            </div>
            <button style={{ background: "linear-gradient(90deg, rgba(0,195,154,1) 0%, rgba(224,205,115,1) 100%)" }} className='h-[50px] font-bold text-[#121418] tracking-wide text-[17px] relative' type='submit'>
              <div style={{ display: isLoading ? "" : "none" }} className='absolute -top-[53px] left-[29.5%]'>
                <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_h9kds1my.json" background="transparent" speed="1" style={{ width: "200px", height: "160px" }} loop autoplay></lottie-player>
              </div>
              <p style={{ display: isLoading ? "none" : "block" }}>Register</p>
            </button>
            <p className='text-[#fff] text-center'>/</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign-In Failed")}
              width="100%"
            />
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Register
