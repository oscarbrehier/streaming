import { requestOTPCode } from "@/actions/requestOTPCode";
import TwoFactorForm from "./TwoFactorForm";
import { cookies } from "next/headers";

export default async function Page() {

	const cookieStore = await cookies();
	const otpSent = cookieStore.get("otp_sent_recently");

	return (

		<TwoFactorForm
			hasSentRecently={!!otpSent}
		/>

	)

};