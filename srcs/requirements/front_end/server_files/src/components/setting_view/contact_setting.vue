<script setup lang="ts">
	import { USER_MANAGEMENT_URL } from '@/config/config.js';
	import { ref, onMounted, nextTick, watch } from 'vue';
	import axios from 'axios';
	import { user } from '../../user';

</script>

<template>
		<div title="contact_container" class="contact_container">
			<div title="rabbit_text" class="rabbit_text" data-i18n="contact.text"></div>
			<img title="rabbit_dance" src="../../../public/images/tronche/h236F6EF1.gif" class="rabbit_gif"></img>
		</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("/fonts/netron.regular.woff2") format("woff2");
}



.contact_container{
	display: flex;
	flex-direction: column;
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
	align-items: center;
	gap: 2rem;
}




.rabbit_text{
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
	font-size: 1.5rem;
	margin-top: 1rem;
}

.rabbit_gif{
	width: 50rem;
	height: 30rem;
}
</style>