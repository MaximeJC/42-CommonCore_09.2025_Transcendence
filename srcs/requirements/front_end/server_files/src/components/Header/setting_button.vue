<script setup lang="ts">
	import { ref } from 'vue';
	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

	const emit = defineEmits(['show_setting']);

	const showSetting = (pageName: string) => {
		//console.log(pageName);
		emit('show_setting', pageName);
	};
</script>

<template>
	<div class="option_container">
		<button title="setting_button" class="setting_button">
			<img src="/images/setting_pink.png" alt="setting_button"></img>
			<img src="/images/setting_yellow.png" alt="setting_button"></img>
		</button>
		<ul class="option-page">
			<li>
				<button @click="showSetting('profil')" class="option-button" data-i18n="setting.profile" ></button>
			</li>
			<li>
				<button  @click="showSetting('about')" class="option-button" data-i18n="setting.about"></button>
			</li>
			<li>
				<button @click="showSetting('contact')" class="option-button" data-i18n="setting.contact"></button>
			</li>
		</ul>
	</div>
</template>

<style>

.option_container{
	display: flex;
	flex-direction: column;
	position: relative;
}

.setting_button{
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(156, 50, 133, 0.5);
	cursor: pointer;
	border-radius: 50%;
	border: 2px solid #e251ca;
	box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
	width: 5rem;
	height: 5rem;
	margin-top: 0.3rem;
}
.setting_button:hover{
	border: 2px solid #fbff22;
	background-color: rgba(251, 255, 34, 0.5);
	box-shadow: 
	0 0 10px #fbff22,
	0 0 20px #fbff22,
	0 0 40px #fbff22,
	0 0 80px #fbff22;
}
.setting_button > img{
		width: 4.1rem;
		height: 4.1rem;
		border-radius: 50%;
}
.setting_button > img:nth-child(2){
	display: none;
}
.setting_button:hover > img:nth-child(1){
	display: none;
}
.setting_button:hover > img:nth-child(2){
	display: block;
}

.option-page{
		list-style: none;
		position: absolute;
		display: none;
		top: 4.3rem;
		width: max-content;
		z-index: 10;
		align-self: end;
		text-align: center;
		background-color: rgba(251, 255, 34, 0,5);
		border: 2px solid #dd0aba;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 1rem 1.15rem;
		margin-top: 1.2rem;
		border-radius: 20px;
		cursor: pointer;
	}

	.option-button{
		position: relative;
		margin-bottom: 1rem;
		font-family: netron;
		align-self: center;
		background-color: rgba(251, 255, 34, 0);
		border: none;
		/*text-align: center;*/
		font-size: 1.5rem;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #dd0aba,
		0 0 120px #dd0aba;
		transition: text-shadow 0.3s ease-in-out ;
	}

	.option-button:hover{
		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22,
		0 0 120px #fbff22;
		cursor: pointer;
	}

	.option_container:hover .option-page{
		display:block;
	}

</style>