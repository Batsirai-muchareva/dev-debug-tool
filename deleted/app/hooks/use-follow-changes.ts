import { useEffect, useState } from "@wordpress/element";
import { storage } from "../utils/local-storage";

const FOLLOW_CHANGES_KEY = 'dev-debug/follow-changes/enabled';

export const useFollowChanges = () => {
  const [ followChanges, setFollowChanges ] = useState( false );

  useEffect( () => {
      setFollowChanges( getStorageValue() )
  }, [ followChanges ] );

  const getStorageValue = () => {
      return !! storage.get( FOLLOW_CHANGES_KEY );
  }

  const toggleFollowChanges = () => {
      const value =  ! getStorageValue();

      setFollowChanges( value );
      storage.set( FOLLOW_CHANGES_KEY, value );
  }

  return {
      followChanges,
      toggleFollowChanges
  }
}
