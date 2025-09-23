import { ref, readonly } from 'vue';
import type { Ref, DeepReadonly } from 'vue';

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
  };

  const clearUser = () => { //pour supprmier utilisateur deco
    currentUser.value = null;
  };

  return {
    currentUser: readonly(currentUser) as DeepReadonly<Ref<User | null>>,
    setUser,
    clearUser,
  };
}