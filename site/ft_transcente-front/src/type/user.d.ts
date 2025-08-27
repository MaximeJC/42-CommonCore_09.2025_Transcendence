export declare class User {
	public _userName: string;
	public _nb_Games: number;
	public _nb_Win: number;
	public _nb_Lose: number;
	public _win_ratio: number;
	public _url_avatar: string;
	public _user_rank: number;

	private _userID: number;
	private _userMail: string;
	private _userPassword: string;
	private _salt_key: string;
	private _user_lvl: string;

	constructor(userName: string, userMail: string, userPassword: string);

	get userId(): number;
	set userId(userId: number);

	get userMail(): string;
	set userMail(userMail: string);

	get userPassword(): string;
	set userPassword(userPassword: string);
	
	get user_lvl(): string;
	set user_lvl(user_lvl: string);
	
	get salt_key(): string;
	set salt_key(salt_key: string);

	public test_password(PassWord: string): void;
}