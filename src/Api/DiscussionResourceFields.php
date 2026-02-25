<?php

namespace Datlechin\TagPasswords\Api;

use Datlechin\TagPasswords\TagProtectionChecker;
use Datlechin\TagPasswords\Utils\ReferrerFinder;
use Flarum\Api\Context;
use Flarum\Api\Schema;
use Flarum\Discussion\Discussion;

class DiscussionResourceFields
{
    /**
     * Memoized protection data keyed by discussion ID + actor ID.
     */
    protected array $cache = [];

    public function __invoke(): array
    {
        return [
            Schema\Arr::make('protectedPasswordTags')
                ->get(fn (Discussion $discussion, Context $context) => $this->getProtectedData($discussion, $context)['protectedPasswordTags']),

            Schema\Arr::make('protectedGroupPermissionTags')
                ->get(fn (Discussion $discussion, Context $context) => $this->getProtectedData($discussion, $context)['protectedGroupPermissionTags']),

            Schema\Integer::make('numberOfProtectedTags')
                ->get(fn (Discussion $discussion, Context $context) => $this->getProtectedData($discussion, $context)['numberOfProtectedTags']),

            Schema\Boolean::make('isProtectedTagDisplayedForDiscussionList')
                ->get(fn (Discussion $discussion, Context $context) => $this->getProtectedData($discussion, $context)['isProtectedTagDisplayedForDiscussionList']),

            Schema\Boolean::make('isProtectedTagDisplayedForDiscussionAvatar')
                ->get(fn (Discussion $discussion, Context $context) => $this->getProtectedData($discussion, $context)['isProtectedTagDisplayedForDiscussionAvatar']),

            Schema\Boolean::make('isProtectedTagDisplayedForPostList')
                ->get(fn (Discussion $discussion, Context $context) => $this->getProtectedData($discussion, $context)['isProtectedTagDisplayedForPostList']),

            Schema\Boolean::make('isProtectedTagDisplayedForDiscussionPage')
                ->get(fn (Discussion $discussion, Context $context) => $this->getProtectedData($discussion, $context)['isProtectedTagDisplayedForDiscussionPage']),
        ];
    }

    public static function slug(Schema\Str $field): Schema\Str
    {
        // Capture the original getter before we override it
        $originalGetter = (fn () => $this->getter)->call($field);

        return $field->get(function (Discussion $discussion, Context $context) use ($originalGetter) {
            $data = (new static)->getProtectedData($discussion, $context);

            if ($data['restrictData']) {
                return (string) $discussion->id;
            }

            // Call the original getter (slug driver's toSlug)
            if ($originalGetter) {
                return $originalGetter($discussion, $context);
            }

            return $discussion->slug;
        });
    }

    public static function title(Schema\Str $field): Schema\Str
    {
        $originalGetter = (fn () => $this->getter)->call($field);

        return $field->get(function (Discussion $discussion, Context $context) use ($originalGetter) {
            $data = (new static)->getProtectedData($discussion, $context);

            if ($data['restrictData']) {
                return '';
            }

            if ($originalGetter) {
                return $originalGetter($discussion, $context);
            }

            return $discussion->title;
        });
    }

    protected function getProtectedData(Discussion $discussion, Context $context): array
    {
        $actor = $context->getActor();
        $cacheKey = $discussion->id . ':' . ($actor->id ?? 'guest');

        if (isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        $request = $context->request;
        $result = TagProtectionChecker::getProtectedTags($discussion, $actor);

        $protectedPasswordTags = $result['passwordTags'];
        $protectedGroupPermissionTags = $result['groupTags'];
        $isProtected = $result['isProtected'];

        // Annotate tags with protection info when viewed from user page
        $isUserPage = false;

        if ($isProtected) {
            $isUserPage = ReferrerFinder::findUserPagePost($request);

            if ($isUserPage) {
                $this->annotateTagsForUserPage($protectedPasswordTags, $protectedGroupPermissionTags);
            }
        }

        $restrictData = false;
        $isProtectedTagDisplayedForDiscussionPage = true;

        if ($isProtected) {
            if (! $isUserPage && ReferrerFinder::findDiscussion($request, $discussion->id)) {
                $isProtectedTagDisplayedForDiscussionPage = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_page');
                $restrictData = ! $isProtectedTagDisplayedForDiscussionPage;
            } else {
                $restrictData = true;
            }
        }

        $totalProtectedTags = count($protectedPasswordTags) + count($protectedGroupPermissionTags);

        $isProtectedTagDisplayedForDiscussionList = false;
        $isProtectedTagDisplayedForDiscussionAvatar = false;
        $isProtectedTagDisplayedForPostList = false;

        if ($totalProtectedTags > 0) {
            $isProtectedTagDisplayedForDiscussionList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_list');
            $isProtectedTagDisplayedForDiscussionAvatar = $actor->hasPermission('flarum-tag-passwords.display_discussion_avatar');
            $isProtectedTagDisplayedForPostList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_post_list');
        }

        return $this->cache[$cacheKey] = [
            'protectedPasswordTags' => $protectedPasswordTags,
            'protectedGroupPermissionTags' => $protectedGroupPermissionTags,
            'numberOfProtectedTags' => $totalProtectedTags,
            'isProtectedTagDisplayedForDiscussionList' => $isProtectedTagDisplayedForDiscussionList,
            'isProtectedTagDisplayedForDiscussionAvatar' => $isProtectedTagDisplayedForDiscussionAvatar,
            'isProtectedTagDisplayedForPostList' => $isProtectedTagDisplayedForPostList,
            'isProtectedTagDisplayedForDiscussionPage' => $isProtectedTagDisplayedForDiscussionPage,
            'restrictData' => $restrictData,
        ];
    }

    protected function annotateTagsForUserPage(array $passwordTags, array $groupTags): void
    {
        foreach ($passwordTags as $tag) {
            $tag->is_unlocked = false;
            $tag->is_password_protected = true;
            $tag->is_group_protected = false;
            $tag->password = null;
        }

        foreach ($groupTags as $tag) {
            $tag->is_unlocked = false;
            $tag->is_password_protected = false;
            $tag->is_group_protected = true;
            $tag->protected_groups = null;
        }
    }
}
