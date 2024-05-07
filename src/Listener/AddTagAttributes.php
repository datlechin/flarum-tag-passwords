<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Tags\Api\Serializer\TagSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Tags\Tag;

class AddTagAttributes
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param TagSerializer $serializer
     * @param Tag $tag
     * @param array $attributes
     * @return array
     */
    public function __invoke(TagSerializer $serializer, Tag $tag, array $attributes): array
    {
        $actor = $serializer->getActor();

        $isUnlocked = true;
        $isPasswordProtected = (bool) $tag->password;
        $isGroupProtected = (bool) $tag->protected_groups;
        // Avoid checking for is_unlock all the time
        if ($isPasswordProtected || $isGroupProtected) {
            $state = $tag->stateFor($actor);
            $isUnlocked = (bool) $state->is_unlocked;
        }
        $isProtectedTagDisplayedForSidebar = false;
        $isLockedIconDisplayed = false;
        $isProtectedTagDisplayedForTagsPage = false;
        if(!$isUnlocked) {
            $isProtectedTagDisplayedForSidebar = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_sidebar');
            $isLockedIconDisplayed = $actor->hasPermission('flarum-tag-passwords.display_unlock_icon');
            $isProtectedTagDisplayedForTagsPage = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_tags_page');
        }
        $attributes['isProtectedTagDisplayedForSidebar'] = $isProtectedTagDisplayedForSidebar;
        $attributes['isLockedIconDisplayed'] = $isLockedIconDisplayed;
        $attributes['isProtectedTagDisplayedForTagsPage'] = $isProtectedTagDisplayedForTagsPage;
        $attributes['isPasswordProtected'] = $isPasswordProtected;
        $attributes['isGroupProtected'] = $isGroupProtected;
        $attributes['isUnlocked'] = $isUnlocked ;

        if ($actor->isAdmin()) {
            $attributes['password'] = $tag->password;
            $attributes['protectedGroups'] = $tag->protected_groups;
        }

        return $attributes;
    }
}
