<?php

namespace Datlechin\TagPasswords\Listener;

use Datlechin\TagPasswords\Utils\ReferrerFinder;
use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Settings\SettingsRepositoryInterface;

class AddDiscussionAttributes
{
    public function __construct(protected SettingsRepositoryInterface $settings) {}

    public function __invoke(BasicDiscussionSerializer $serializer, Discussion $discussion, array $attributes): array
    {
        $actor = $serializer->getActor();

        $protectedPasswordTags = [];
        $protectedGroupPermissionTags = [];
        $isChecked = $isUserPage = $isProtected = $restrictData = false;

        foreach ($discussion->tags as &$tag) {
            $isPasswordProtected = (bool) $tag->password;
            $isGroupPermissionProtected = (bool) $tag->protected_groups;

            if ($isPasswordProtected || $isGroupPermissionProtected) {
                if (! $isChecked) {
                    // Avoid checking the header multiple times, this is used to identify User Page Post
                    $isUserPage = ReferrerFinder::findUserPagePost($serializer->getRequest());
                    $isChecked = true;
                }

                // Only do actor checks if tag has any protection
                $isUnlocked = $actor->can('isTagUnlocked', $tag);

                if (! $isUnlocked) {
                    if (! $isProtected) {
                        $isProtected = true;
                    }

                    if ($isPasswordProtected) {
                        if ($isUserPage) {
                            $tag->is_unlocked = $isUnlocked;
                            $tag->is_password_protected = $isPasswordProtected;
                            $tag->is_group_protected = false;
                            $tag->password = null;
                        }

                        array_push($protectedPasswordTags, $tag);
                    } else {
                        if ($isUserPage) {
                            $tag->is_unlocked = $isUnlocked;
                            $tag->is_password_protected = false;
                            $tag->is_group_protected = $isGroupPermissionProtected;
                            $tag->protected_groups = null;
                        }

                        array_push($protectedGroupPermissionTags, $tag);
                    }
                }
            }
        }

        $isProtectedTagDisplayedForDiscussionPage = true;

        if ($isProtected) {
            if (! $isUserPage && ReferrerFinder::findDiscussion($serializer->getRequest(), $discussion->id)) {
                $isProtectedTagDisplayedForDiscussionPage = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_page');
                $restrictData = ! $isProtectedTagDisplayedForDiscussionPage;
            } else {
                $restrictData = true;
            }
        }

        if ($restrictData) {
            // Discussion slug and title is empty to restricting data from API usage, to ensure compatibility with other extension that are using truncate on string. Slug and title must be an empty string '', for example truncate(discussion.title()) to stop breakage.
            $attributes['id'] = null;
            $attributes['slug'] = '';
            $attributes['title'] = '';
        }

        $totalProtectedTags = count($protectedPasswordTags) + count($protectedGroupPermissionTags);
        $attributes['protectedPasswordTags'] = $protectedPasswordTags;
        $attributes['protectedGroupPermissionTags'] = $protectedGroupPermissionTags;
        $attributes['numberOfProtectedTags'] = $totalProtectedTags;

        $isProtectedTagDisplayedForDiscussionList = false;
        $isProtectedTagDisplayedForDiscussionAvatar = false;
        $isProtectedTagDisplayedForPostList = false;

        if ($totalProtectedTags > 0) {
            $isProtectedTagDisplayedForDiscussionList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_list');
            $isProtectedTagDisplayedForDiscussionAvatar = $actor->hasPermission('flarum-tag-passwords.display_discussion_avatar');
            $isProtectedTagDisplayedForPostList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_post_list');
        }

        $attributes['isProtectedTagDisplayedForDiscussionList'] = $isProtectedTagDisplayedForDiscussionList;
        $attributes['isProtectedTagDisplayedForDiscussionAvatar'] = $isProtectedTagDisplayedForDiscussionAvatar;
        $attributes['isProtectedTagDisplayedForPostList'] = $isProtectedTagDisplayedForPostList;
        $attributes['isProtectedTagDisplayedForDiscussionPage'] = $isProtectedTagDisplayedForDiscussionPage;

        return $attributes;
    }
}
