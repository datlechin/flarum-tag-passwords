<?php

namespace Datlechin\TagPasswords\Api;

use Flarum\Api\Context;
use Flarum\Api\Schema;
use Flarum\Tags\Tag;

class TagResourceFields
{
    public function __invoke(): array
    {
        return [
            Schema\Boolean::make('isPasswordProtected')
                ->get(fn (Tag $tag) => (bool) $tag->password),

            Schema\Boolean::make('isGroupProtected')
                ->get(fn (Tag $tag) => (bool) $tag->protected_groups),

            Schema\Boolean::make('isUnlocked')
                ->get(fn (Tag $tag, Context $context) => $context->getActor()->can('isTagUnlocked', $tag)),

            self::conditionalPermissionField('isLockedIconDisplayed', 'flarum-tag-passwords.display_unlock_icon'),
            self::conditionalPermissionField('isProtectedTagDisplayedForSidebar', 'flarum-tag-passwords.display_protected_tag_from_sidebar'),
            self::conditionalPermissionField('isProtectedTagDisplayedForTagsPage', 'flarum-tag-passwords.display_protected_tag_from_tags_page'),
            self::conditionalPermissionField('isProtectedTagDisplayedForPostList', 'flarum-tag-passwords.display_protected_tag_from_post_list'),

            Schema\Str::make('password')
                ->nullable()
                ->visible(fn (Tag $tag, Context $context) => $context->getActor()->isAdmin())
                ->writable(fn (Tag $tag, Context $context) => $context->getActor()->isAdmin())
                ->get(fn (Tag $tag) => $tag->password)
                ->set(function (Tag $tag, ?string $value) {
                    $tag->password = $value;
                }),

            Schema\Str::make('protectedGroups')
                ->nullable()
                ->visible(fn (Tag $tag, Context $context) => $context->getActor()->isAdmin())
                ->writable(fn (Tag $tag, Context $context) => $context->getActor()->isAdmin())
                ->get(fn (Tag $tag) => $tag->protected_groups)
                ->set(function (Tag $tag, ?string $value) {
                    $tag->protected_groups = $value;
                }),
        ];
    }

    private static function conditionalPermissionField(string $name, string $permission): Schema\Boolean
    {
        return Schema\Boolean::make($name)
            ->get(function (Tag $tag, Context $context) use ($permission) {
                $actor = $context->getActor();

                if (! $actor->can('isTagUnlocked', $tag)) {
                    return $actor->hasPermission($permission);
                }

                return false;
            });
    }
}
