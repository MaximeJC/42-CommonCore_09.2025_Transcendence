<script setup lang="ts">
	import { ref, onMounted, nextTick, watch } from 'vue';
	import profile from '../components/setting_view/profile_setting.vue'
	const props = defineProps<{
			setLanguage: (lang: string) => void;
			setting_activePage: string;
	}>();

</script>
	
<template>
	<div class="s_page">
		<profile v-show="setting_activePage == 'profil'" :setLanguage="props.setLanguage"></profile>
	</div>	
</template>

<style>
	.s_page{
		display: flex;
		align-items: start;
		gap: 1rem;
	}
</style>