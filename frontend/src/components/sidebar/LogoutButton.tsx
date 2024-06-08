import { LogOut } from "lucide-react";
import useLogout from "../../hooks/useLogout";
import toast from "react-hot-toast";

const LogoutButton = () => {
	const {loading, logout}= useLogout();
	return (
		<div className='mt-auto'>
			<LogOut className='w-6 h-6 text-white cursor-pointer' onClick={logout} />
		</div>
	);
};
export default LogoutButton;
