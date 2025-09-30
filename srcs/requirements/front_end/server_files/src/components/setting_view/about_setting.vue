<script setup lang="ts">
	import { USER_MANAGEMENT_URL } from '@/config/config.js';
	import { ref, onMounted, nextTick, watch } from 'vue';
	import axios from 'axios';
	import { user } from '../../user';

</script>

<template>
		<div title="about_container" class="about_container">
			<div title="about_title" class="about_title" data-i18n="setting.about"></div>
			<div title="about_title" class="about_title" data-i18n="setting.teams"></div>
			<div title="about's_container" class="abouts_container">
				<div title="about_container" class="solo_container">
					<img src="../../../public/images/tronche/ahoizai.jpg" class="tronche"></img>
					<div title="axel_name" class="name">Axel Hoizai</div>
				</div>
				<div title="about_container" class="solo_container">
					<img src="../../../public/images/tronche/lcollong.jpg" class="tronche"></img>
					<div title="louise_name" class="name">Louise Collonge</div>
				</div>
				<div title="about_container" class="solo_container">
					<img src="../../../public/images/tronche/mgouraud.jpg" class="tronche"></img>
					<div title="maxime_name" class="name">Maxime Gouraud</div>
				</div>
				<div title="about_container" class="solo_container">
					<img src="../../../public/images/tronche/nicolmar.jpg" class="tronche"></img>
					<div title="nicolas_name" class="name">Nicolas Martin</div>
				</div>
				<div title="about_container" class="solo_container">
					<img src="../../../public/images/tronche/mdemare.jpg" class="tronche"></img>
					<div title="mickael_name" class="name">Mickaël Démare</div>
				</div>
			</div>
		</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("/fonts/netron.regular.woff2") format("woff2");
}



.about_container{
	display: grid;

	grid-template-rows: min-content;
	grid-template-columns: 1fr;
	/* width: 32rem;*/
	width: 100%;
	background-color: rgba(156, 50, 133, 0.5);
	border: 2px solid #e251ca;
	box-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba;
	padding: 1rem 1.2rem;
	border-radius: 20px;
}

.about_title{
	justify-self: center;
	font-family: netron;
	font-weight: bold;
	color: white;
	text-align: center;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba,
	0 0 80px #ff69b4,
	0 0 120px #dd0aba;
	font-size: 1.8rem;
	margin-top: 1rem;
	margin-bottom: 1rem;
}

.abouts_container{
	display: grid;
	grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
	grid-template-columns: 1fr;
	
	
}

.solo_container{
	display: grid;
	grid-template-rows: 1fr;
	grid-template-columns: 0.5fr 1fr;
	align-items: center;
	margin-bottom: 1rem;
}

.name{
	font-family: netron;
	font-weight: bold;
	color: white;
	text-align: start;
	text-shadow: 
	0 0 10px #0abddd,
	0 0 10px #0abddd,
	0 0 20px #0abddd,
	0 0 40px #dd0aba,
	0 0 80px #ff69b4,
	0 0 120px #dd0aba;
	font-size: 1.8rem;
	margin-top: 1rem;
}

.tronche{
	width: 5rem;
	height: 5rem;
	border-radius: 50%;
}
</style>