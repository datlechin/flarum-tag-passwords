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

        $isPasswordProtected = (bool) $tag->password;
        $isGroupPermissionProtected = (bool) $tag->protected_groups;
        $isUnlocked = $actor->can('isTagUnlocked', $tag);

        $attributes['isPasswordProtected'] = $isPasswordProtected;
        $attributes['isGroupProtected'] = $isGroupPermissionProtected;
        $attributes['isUnlocked'] = $isUnlocked ;

        $isProtectedTagDisplayedForSidebar = false;
        $isLockedIconDisplayed = false;
        $isProtectedTagDisplayedForTagsPage = false;
        $isProtectedTagDisplayedForPostList = false;

        if(!$isUnlocked) {
            $isProtectedTagDisplayedForSidebar = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_sidebar');
            $isLockedIconDisplayed = $actor->hasPermission('flarum-tag-passwords.display_unlock_icon');
            $isProtectedTagDisplayedForTagsPage = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_tags_page');
            $isProtectedTagDisplayedForPostList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_post_list');
        }
        $attributes['isProtectedTagDisplayedForSidebar'] = $isProtectedTagDisplayedForSidebar;
        $attributes['isLockedIconDisplayed'] = $isLockedIconDisplayed;
        $attributes['isProtectedTagDisplayedForTagsPage'] = $isProtectedTagDisplayedForTagsPage;
        $attributes['isProtectedTagDisplayedForPostList'] = $isProtectedTagDisplayedForPostList;


        if ($actor->isAdmin()) {
            $attributes['password'] = $tag->password;
            $attributes['protectedGroups'] = $tag->protected_groups;
        }

        return $attributes;
    }
}
