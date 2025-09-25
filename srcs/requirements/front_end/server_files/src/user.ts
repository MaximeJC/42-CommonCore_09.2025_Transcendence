import { ref, readonly } from 'vue';
import type { Ref, DeepReadonly } from 'vue';
import { socket, connectSocket, disconnectSocket } from '@/service/socketService'; // Import le socket

export interface User {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  rank: number;
  nb_games: number;
  nb_won_games: number;
}

const currentUser: Ref<User | null> = ref(null);

export function user() {

  const setUser = (userData: User) => { // pour ajouter utilisateur quand connecte
    currentUser.value = userData;
    connectSocket(userData.login); //connexion au socket
  };

  const clearUser = () => { //pour supprmier utilisateur deco
    currentUser.value = null;
    disconnectSocket(); //deconnexion au socket
  };

  return {
    currentUser: readonly(currentUser) as DeepReadonly<Ref<User | null>>,
    setUser,
    clearUser,
  };
}