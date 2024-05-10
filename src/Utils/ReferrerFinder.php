<?php

namespace Datlechin\TagPasswords\Utils;

use Psr\Http\Message\ServerRequestInterface as Request;

class ReferrerFinder
{
    static function findDiscussion(Request $request, int $discussionId): bool
    {
        // Must check if API is loaded within the direct link of the discussion
        $target = $request->getRequestTarget();
        if (str_starts_with($target, '/discussions/'.$discussionId)) {
            return true;
        }
        $headers = $request->getHeaders();
        $referers = $headers['referer'] ?? [];
        foreach ($referers as &$url) {
            $urlPath = parse_url($url, PHP_URL_PATH);
            if (str_starts_with($urlPath, '/d/'.$discussionId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Used to identify the API referer for the User Page, there is an issue of loading the extended Tag variables.
     * This can be safely removed when /u/[index] works with the extended Flarum Tag Model, for the time being ProtectedTag model was created.
     * That is used in editPostsUserPage for viewing Post made by user, but avoid Discussion List for User Page
     */
    static function findUserPagePost(Request $request): bool
    {
        $headers = $request->getHeaders();
        $referrer = $headers['referer'] ?? [];
        foreach ($referrer as &$url) {
            $urlPath = parse_url($url, PHP_URL_PATH);
            if (str_starts_with($urlPath, '/u/') && !str_ends_with($urlPath, '/discussions')) {
                return true;
            }
        }
        return false;
    }
}
