import React, {createContext, useContext, useEffect, useState} from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}



interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user:User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined)


export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true);


    useEffect(() => {
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setIsAuthLoading(false)
    }, []);

    const login = (token: string, user: User):void => {
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        setToken(token)
        setUser(user)
    }
    const logout = () => {
        localStorage.clear()
        setToken(null)
        setUser(null)
    }


    return (
        <AuthContext.Provider value={{user, token, login, logout,isAuthLoading, isAuthenticated: !!token}}>
            {children}
        </AuthContext.Provider>
    )

}


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}
