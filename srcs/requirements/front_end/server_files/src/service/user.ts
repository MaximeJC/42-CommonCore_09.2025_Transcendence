
export  class User{
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
	private _user_lvl: number;

	constructor(userName: string, userMail: string, userPassword:string){
		this._userName = userName;
		this._nb_Games = 0;
		this._nb_Win = 0;
		this._nb_Lose = 0;
		this._win_ratio = 0;
		this._url_avatar = "../../images/default_avatar.png"
		this._user_rank = -1;

		this._userID = -1;
		this._userMail = userMail;
		this._userPassword = userPassword;
		this._user_lvl = 0;
		this._salt_key = "";
	}

	set userId(userId:number)
	{
		this._userID = userId;
	}

	set userMail(userMail:string)
	{
		this._userMail = userMail;
	}
	
	set userPassword(userPassword:string)
	{
		this.userPassword = userPassword;
	}
	
	set user_lvl(user_lvl:number)
	{
		this._user_lvl = user_lvl;
	}
	
	set salt_key(salt_key:string)
	{
		this.salt_key = salt_key;
	}

	get userId()
	{
		return this._userID;
	}

	get userMail()
	{
		return this._userMail;
	}
	
	get userPassword()
	{
		return this.userPassword;
	}
	
	get user_lvl()
	{
		return  this._user_lvl;
	}
	
	get salt_key()
	{
		return this._salt_key;
	}

	public test_password(PassWord:string)
	{
		if (this._userPassword != PassWord)
			throw new Error("Wrong Password");
	}

	}