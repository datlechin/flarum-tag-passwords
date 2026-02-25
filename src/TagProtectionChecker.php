<?php

namespace Datlechin\TagPasswords;

use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;
use Flarum\User\User;

class TagProtectionChecker
{
    public static function isProtected(Tag $tag): bool
    {
        return (bool) $tag->password || (bool) $tag->protected_groups;
    }

    public static function isUnlocked(User $actor, Tag $tag): bool
    {
        if (! static::isProtected($tag)) {
            return true;
        }

        return (bool) $tag->stateFor($actor)->is_unlocked;
    }

    /**
     * Get protected tags for a discussion grouped by type.
     *
     * @return array{passwordTags: Tag[], groupTags: Tag[], isProtected: bool}
     */
    public static function getProtectedTags(Discussion $discussion, User $actor): array
    {
        $passwordTags = [];
        $groupTags = [];

        foreach ($discussion->tags as $tag) {
            if (! static::isProtected($tag)) {
                continue;
            }

            if ($actor->can('isTagUnlocked', $tag)) {
                continue;
            }

            if ((bool) $tag->password) {
                $passwordTags[] = $tag;
            } else {
                $groupTags[] = $tag;
            }
        }

        return [
            'passwordTags' => $passwordTags,
            'groupTags' => $groupTags,
            'isProtected' => count($passwordTags) + count($groupTags) > 0,
        ];
    }
}
