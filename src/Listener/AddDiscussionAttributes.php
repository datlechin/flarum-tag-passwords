<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;

class AddDiscussionAttributes
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * Used to identify the API referer for the User Page, there is an issue of loading the extended Tag variables.
     * This can be safely removed when /u/[index] works with the extended Flarum Tag Model, for the time being ProtectedTag model was created.
     * That is used in editPostsUserPage.
     */
    public function findReferrerUserPage($headers)
    {
        $referrer = $headers['referer'] ?? [];
        $isFound = false;
        foreach ($referrer as &$url) {
            $urlPath = parse_url($url, PHP_URL_PATH);
            if (str_starts_with($urlPath, '/u/')) {
                return $isFound = true;
            }
        }
        return $isFound;
    }

    /**
     * @param BasicDiscussionSerializer $serializer
     * @param Discussion $discussion
     * @param array $attributes
     * @return array
     */
    public function __invoke(BasicDiscussionSerializer $serializer, Discussion $discussion, array $attributes): array
    {
        $actor = $serializer->getActor();

        $protectedPasswordTags = [];
        $protectedGroupPermissionTags = [];
        $isChecked = $isUserPage = false;
        foreach ($discussion->tags as &$tag) {
            $isPasswordProtected = (bool) $tag->password;
            $isGroupPermissionProtected = (bool) $tag->protected_groups;
            if ($isPasswordProtected || $isGroupPermissionProtected) {
                if (!$isChecked) {
                    $headers = $serializer->getRequest()->getHeaders();
                    $isUserPage = $this->findReferrerUserPage($headers);
                }
                // Only do actor checks if tag has any protection
                $state = $tag->stateFor($actor);
                $isUnlocked =  (bool) $state->is_unlocked;
                if (!$isUnlocked) {
                    $tag->is_unlocked = $isUnlocked;
                    if ($isPasswordProtected) {
                        if ($isUserPage) {
                            $tag->is_password_protected = $isPasswordProtected;
                            $tag->is_group_protected = false;
                            $tag->password = null;
                        }
                        array_push($protectedPasswordTags, $tag);
                    } else {
                        if ($isUserPage) {
                            $tag->is_password_protected = false;
                            $tag->is_group_protected = $isGroupPermissionProtected;
                            $tag->protected_groups = null;
                        }
                        array_push($protectedGroupPermissionTags, $tag);
                    }
                }
            }
        }

        $totalProtectedTags = count($protectedPasswordTags) + count($protectedGroupPermissionTags);
        $attributes['protectedPasswordTags'] = $protectedPasswordTags;
        $attributes['protectedGroupPermissionTags'] = $protectedGroupPermissionTags;
        $attributes['numberOfProtectedTags'] = $totalProtectedTags;

        $isProtectedTagDisplayedForDiscussionList = false;
        $isProtectedTagDisplayedForDiscussionAvator = false;
        $isProtectedTagDisplayedForPostList = false;
        if($totalProtectedTags > 0) {
            $isProtectedTagDisplayedForDiscussionList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_list');
            $isProtectedTagDisplayedForDiscussionAvator = $actor->hasPermission('flarum-tag-passwords.display_discussion_avator');
            $isProtectedTagDisplayedForPostList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_post_list');
        }
        $attributes['isProtectedTagDisplayedForDiscussionList'] = $isProtectedTagDisplayedForDiscussionList;
        $attributes['isProtectedTagDisplayedForDiscussionAvator'] = $isProtectedTagDisplayedForDiscussionAvator;
        $attributes['isProtectedTagDisplayedForPostList'] = $isProtectedTagDisplayedForPostList;
        return $attributes;
    }
}