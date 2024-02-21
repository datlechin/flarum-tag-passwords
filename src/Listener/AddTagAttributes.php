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

        $state = $tag->stateFor($actor);
        $attributes['isProtectedTagDisplayedForSidebar'] = $this->settings->get('flarum-tag-passwords.display_protected_tag_from_sidebar');
        $attributes['isLockedIconDisplayed'] = $this->settings->get('flarum-tag-passwords.display_unlock_icon');
        $attributes['isProtectedTagDisplayedForTagsPage'] = $this->settings->get('flarum-tag-passwords.display_protected_tag_from_tags_page');
        $attributes['isPasswordProtected'] = (bool) $tag->password;
        $attributes['isGroupProtected'] = (bool) $tag->protected_groups;
        $attributes['isUnlocked'] = (bool) $state->is_unlocked;
        if ($actor->isAdmin()) {
            $attributes['password'] = $tag->password;
            $attributes['protectedGroups'] = $tag->protected_groups;
        }

        return $attributes;
    }
}
