"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateInviteCode } from "@/actions/generateInviteCode";
import { useState } from "react";
import { GenerateInviteCode } from "./GenerateInviteCode";

export default function Page() {

	return (

		<div className="h-screen w-full flex flex-col">

			<div
				className="w-full flex items-center border-b border-border px-8 py-4"
			>

				<p
					className="text-lg font-semibold"
				>Dashboard</p>

			</div>

			<div className="h-full w-96 border-r border-border p-8">

				<GenerateInviteCode />

			</div>

		</div>

	);

};